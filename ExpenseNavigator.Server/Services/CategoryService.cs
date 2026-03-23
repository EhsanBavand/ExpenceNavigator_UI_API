using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using static ExpenseNavigatorAPI.Helper.HelperExtention;

namespace ExpenseNavigatorAPI.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(string userId, int month, int year)
        {
            var categories = await _context.Categories.Where(c => c.UserId == userId).ToListAsync();
            var budgets = await _context.UserCategoryBudget.Where(b => b.UserId == userId && b.Month == month && b.Year == year).ToListAsync();

            // Fast lookup
            var budgetLookup = budgets.ToDictionary(b => b.CategoryId, b => b);

            var result = new List<CategoryDto>();

            foreach (var cat in categories)
            {
                budgetLookup.TryGetValue(cat.Id, out var budget);
                result.Add(new CategoryDto
                {
                    UserId = userId,
                    CatId = cat.Id.ToString(),
                    Name = cat.Name,
                    IsActive = cat.IsActive,
                    Budget = budget?.Budget ?? 0,
                    IsRecurring = budget?.IsRecurring ?? false,
                    Month = month,
                    Year = year
                });
            }

            return result
                .OrderByDescending(c => c.IsActive)   // true first
                //.ThenByDescending(c => c.Budget)      // highest budget first
                .ThenBy(c => c.Name)                  // name A–Z
                .ToList();

        }
        public async Task<CategoryDto> GetCategoryByIdAsync(Guid id, string userId, int month, int year)
        {
            var result = new CategoryDto();
            var category = await _context.Categories.Include(c => c.Budgets).FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return null;

            var budget = category.Budgets.FirstOrDefault(b => b.Month == month && b.Year == year && b.IsActive);

            result.CatId = category.Id.ToString();
            result.UserId = category.UserId;
            result.Name = category.Name;
            result.IsActive = category.IsActive;
            result.Budget = budget?.Budget ?? 0;
            result.IsRecurring = budget?.IsRecurring ?? false;
            result.Month = month;
            result.Year = year;

            return result;
        }
        public async Task<CategoryDto> AddUserCategoryAsync(string userId, string name, decimal budget, bool isRecurring)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = name,
                CreatedDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.Categories.Add(category);

            var month = DateTime.UtcNow.Month;
            var year = DateTime.UtcNow.Year;

            var userCategoryBudget = new UserCategoryBudget
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CategoryId = category.Id,
                Budget = budget,
                Month = month,
                Year = year,
                IsRecurring = isRecurring,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.UserCategoryBudget.Add(userCategoryBudget);

            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                CatId = category.Id.ToString(),
                UserId = userId,
                Name = name,
                IsActive = true,
                Budget = budget,
                IsRecurring = isRecurring,
                Month = month,
                Year = year
            };
        }
        public async Task<CategoryDto?> UpdateUserCategoryAsync(CategoryDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.CatId))
                return null;

            if (!Guid.TryParse(dto.CatId, out Guid categoryId))
                return null;

            var entity = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == dto.UserId);

            if (entity == null)
                return null;

            // ===== UPDATE CATEGORY =====
            entity.Name = dto.Name;
            entity.IsActive = dto.IsActive;

            // ===== FIND BUDGET =====
            var budget = await _context.UserCategoryBudget
                .SingleOrDefaultAsync(b =>
                    b.CategoryId == categoryId &&
                    b.UserId == dto.UserId &&
                    b.Month == dto.Month &&
                    b.Year == dto.Year);

            // ===== UPSERT BUDGET =====
            if (budget == null)
            {
                budget = new UserCategoryBudget
                {
                    Id = Guid.NewGuid(),
                    UserId = dto.UserId,
                    CategoryId = categoryId,
                    Month = dto.Month,
                    Year = dto.Year,
                    CreatedDate = DateTime.UtcNow
                };

                await _context.UserCategoryBudget.AddAsync(budget);
            }

            // Always update values (works for both new and existing)
            budget.Budget = dto.Budget;
            budget.IsRecurring = dto.IsRecurring;
            budget.IsActive = true;
            budget.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return dto;
        }
        public async Task<bool> DeleteUserCategoryAsync(Guid categoryId, string userId, int month, int year)
        {
            // 1. Fetch the category
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);

            if (category == null)
                return false;

            // 2. Soft delete the category
            category.IsActive = false;
            category.CreatedDate = category.CreatedDate;

            // 3. Soft delete subcategories
            var subCategories = await _context.SubCategories
                .Where(s => s.CategoryId == categoryId)
                .ToListAsync();

            foreach (var sub in subCategories)
            {
                sub.IsActive = false;
                sub.IsRecurring = false; // optional
            }

            // 4. Soft delete all previous user budgets
            var budgets = await _context.UserCategoryBudget
                .Where(b => b.CategoryId == categoryId && b.UserId == userId)
                .ToListAsync();

            foreach (var b in budgets)
            {
                b.IsActive = false;
                b.UpdatedDate = DateTime.UtcNow;
            }

            // 5. Add a new budget record for current month with Budget = 0
            bool budgetExistsThisMonth = budgets.Any(b => b.Month == month && b.Year == year);
            if (!budgetExistsThisMonth)
            {
                var newBudget = new UserCategoryBudget
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CategoryId = categoryId,
                    Budget = 0,
                    Month = month,
                    Year = year,
                    IsRecurring = false,
                    IsActive = false,
                    CreatedDate = DateTime.UtcNow
                };
                _context.UserCategoryBudget.Add(newBudget);
            }

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<(bool Success, string Message)> CopyBudgetFromSourceMonthToTargets(CopyItemsByRangeDateDto dto)
        {
            // 1. Get all budgets in the source month
            var sourceBudgets = await _context.UserCategoryBudget
                .AsNoTracking()
                .Where(b => b.UserId == dto.UserId
                            && b.Month == dto.SourceMonth
                            && b.Year == dto.SourceYear
                            && b.IsActive)
                .ToListAsync();

            if (!sourceBudgets.Any())
                return (false, "No data found in the source month.");

            // 2. Generate target months
            var targets = GetMonthsInRange(dto.TargetFromMonth, dto.TargetToMonth)
                .Where(m => !(m.Year == dto.SourceYear && m.Month == dto.SourceMonth))
                .ToList();

            if (!targets.Any())
                return (false, "No valid target months to copy.");

            // 3. Get existing budgets in target months to avoid duplicates
            var targetMonths = targets.Select(t => t.Month).ToHashSet();
            var existing = await _context.UserCategoryBudget
                .AsNoTracking()
                .Where(b => b.UserId == dto.UserId
                            && b.Year == dto.SourceYear
                            && targetMonths.Contains(b.Month))
                .Select(b => new { b.CategoryId, b.Month })
                .ToListAsync();

            var existingSet = new HashSet<string>(
                existing.Select(e => $"{e.CategoryId}:{e.Month}")
            );

            // 4. Prepare budgets to insert
            var toInsert = new List<UserCategoryBudget>();
            var skippedMonths = new HashSet<int>();

            foreach (var (year, month) in targets)
            {
                bool monthHasData = false;

                foreach (var b in sourceBudgets)
                {
                    string key = $"{b.CategoryId}:{month}";
                    if (existingSet.Contains(key))
                    {
                        monthHasData = true;
                        continue;
                    }

                    toInsert.Add(new UserCategoryBudget
                    {
                        Id = Guid.NewGuid(),
                        UserId = b.UserId,
                        CategoryId = b.CategoryId,
                        Budget = b.Budget,
                        Month = month,
                        Year = year,
                        IsActive = b.IsActive,
                        IsRecurring = b.IsRecurring,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                if (monthHasData && !toInsert.Any(x => x.Month == month))
                {
                    skippedMonths.Add(month);
                }
            }

            if (!toInsert.Any())
                return (false, skippedMonths.Any() ? $"All target months already have data: {string.Join(", ", skippedMonths.Select(m => MonthNames[m - 1]))}" : "No new data to copy.");

            // 5. Insert into DB
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.UserCategoryBudget.AddRange(toInsert);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                string message = skippedMonths.Any()
                    ? $"Copied successfully. Skipped months with existing data: {string.Join(", ", skippedMonths.Select(m => MonthNames[m - 1]))}"
                    : "Copied successfully to all target months.";

                return (true, message);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
    }
}
