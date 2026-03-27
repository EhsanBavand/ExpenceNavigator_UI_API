using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using static ExpenseNavigatorAPI.Helper.HelperExtention;

namespace ExpenseNavigatorAPI.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly ApplicationDbContext _context;

        public ExpenseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Expense>> GetAllAsync(string userId, int month, int year)
        {
            try
            {
                var results = new List<Expense>();
                var query = _context.Expenses
                    .AsNoTracking()
                    .Where(e => e.UserId == userId && e.Month == month && e.Year == year)
                    .OrderByDescending(e => e.Date);
                results = await query.ToListAsync();
                return results;
            }
            catch (Exception ex)
            {
                LogError(ex, userId, month, year, nameof(GetAllAsync));
                throw;
            }
        }
        public async Task<Expense?> GetByIdAsync(Guid id)
        {
            try
            {
                return await _context.Expenses
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseService] Error in {nameof(GetByIdAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<List<Expense>> GetByMonthYearAsync(int month, int year)
        {
            try
            {
                return await _context.Expenses
                    .AsNoTracking()
                    .Where(e => e.Month == month && e.Year == year)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseService] Error in {nameof(GetByMonthYearAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<Expense> AddAsync(Expense dto)
        {
            try
            {
                //if (!await _context.Users.AnyAsync(u => u.Id == dto.UserId))
                //    throw new Exception($"User {dto.UserId} does not exist.");

                //if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                //    throw new Exception($"Category {dto.CategoryId} does not exist.");

                //if (dto.SubCategoryId.HasValue &&
                //    !await _context.SubCategories.AnyAsync(sc => sc.Id == dto.SubCategoryId.Value))
                //    throw new Exception($"SubCategory {dto.SubCategoryId} does not exist.");

                //if (dto.PlaceId.HasValue &&
                //    !await _context.Places.AnyAsync(p => p.Id == dto.PlaceId.Value))
                //    throw new Exception($"Place {dto.PlaceId} does not exist.");

                var expense = new Expense
                {
                    Id = Guid.NewGuid(),
                    UserId = dto.UserId,
                    CategoryId = dto.CategoryId,
                    SubCategoryId = dto.SubCategoryId,
                    PlaceId = dto.PlaceId,
                    ItemName = dto.ItemName,
                    Amount = dto.Amount,
                    PaidFor = dto.PaidFor,
                    Note = dto.Note,
                    Date = dto.Date,
                    IsFixed = dto.IsFixed,
                    Month = dto.Month,
                    Year = dto.Year,
                    ExtraData = dto.ExtraData
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

                return expense;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseService] Error in AddAsync: {ex}");
                throw;
            }
        }
        public async Task<bool> UpdateAsync(ExpenseDto dto, Guid id)
        {
            try
            {
                var existing = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id);
                if (existing == null) return false;

                existing.UserId = dto.UserId;
                existing.CategoryId = dto.CategoryId;
                existing.SubCategoryId = dto.SubCategoryId;
                existing.PlaceId = dto.PlaceId;
                existing.ItemName = dto.ItemName;
                existing.Amount = dto.Amount;
                existing.PaidFor = dto.PaidFor;
                existing.Note = dto.Note;
                existing.IsFixed = dto.IsFixed;
                if (dto.Date.HasValue)
                {
                    existing.Date = dto.Date.Value;
                }

                existing.Month = dto.Month;
                existing.Year = dto.Year;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseService] Error in {nameof(UpdateAsync)}: {ex.Message}");
                throw;
            }
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id);
                if (expense == null) return false;

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseService] Error in {nameof(DeleteAsync)}: {ex.Message}");
                throw;
            }
        }
        //public async Task<(bool Success, string Message)> CopyExpensesFromSourceMonthToTargets(CopyItemsByRangeDateDto dto)
        //{
        //    // Get all fixed expenses in the source month
        //    var sourceFixed = await _context.Expenses
        //        .AsNoTracking()
        //        .Where(e => e.UserId == dto.UserId
        //                    && e.Month == dto.SourceMonth
        //                    && e.Year == dto.SourceYear
        //                    && e.IsFixed)
        //        .ToListAsync();

        //    if (!sourceFixed.Any())
        //        return (false, "No data found in the source month.");

        //    // Generate target months list
        //    var targets = GetMonthsInRange(dto.TargetFromMonth, dto.TargetToMonth)
        //        .Where(m => !(m.Year == dto.SourceYear && m.Month == dto.SourceMonth))
        //        .ToList();

        //    if (!targets.Any())
        //        return (false, "No valid target months to copy.");

        //    // Check existing fixed expenses in the target months
        //    var targetYears = targets.Select(t => t.Year).ToHashSet();
        //    var targetMonths = targets.Select(t => t.Month).ToHashSet();

        //    var existing = await _context.Expenses
        //        .AsNoTracking()
        //        .Where(e => e.UserId == dto.UserId
        //                    && e.IsFixed
        //                    && targetYears.Contains(e.Year)
        //                    && targetMonths.Contains(e.Month))
        //        .Select(e => new
        //        {
        //            e.Year,
        //            e.Month,
        //            e.CategoryId,
        //            e.SubCategoryId,
        //            e.PlaceId,
        //            e.ItemName,
        //            e.Amount,
        //            e.IsFixed
        //        })
        //        .ToListAsync();

        //    static string Key(int year, int month, Guid cat, Guid? sub, Guid? place, string? item, decimal amt, bool fixedFlag)
        //        => $"{year}:{month}:{cat}:{(sub?.ToString() ?? "-")}:{(place?.ToString() ?? "-")}:{(item ?? "-")}:{amt}:{fixedFlag}";

        //    var existingSet = new HashSet<string>(
        //        existing.Select(e => Key(e.Year, e.Month, e.CategoryId, e.SubCategoryId, e.PlaceId, e.ItemName, e.Amount, e.IsFixed))
        //    );

        //    var toInsert = new List<Expense>();
        //    var skippedMonths = new List<string>();

        //    foreach (var (year, month) in targets)
        //    {
        //        bool monthHasData = false;

        //        foreach (var s in sourceFixed)
        //        {
        //            var day = Math.Min(s.Date.Day, DateTime.DaysInMonth(year, month));
        //            var k = Key(year, month, s.CategoryId, s.SubCategoryId, s.PlaceId, s.ItemName, s.Amount, s.IsFixed);
        //            if (existingSet.Contains(k))
        //            {
        //                monthHasData = true;
        //                continue;
        //            }

        //            toInsert.Add(new Expense
        //            {
        //                Id = Guid.NewGuid(),
        //                UserId = s.UserId,
        //                CategoryId = s.CategoryId,
        //                SubCategoryId = s.SubCategoryId,
        //                PlaceId = s.PlaceId,
        //                ItemName = s.ItemName,
        //                Amount = s.Amount,
        //                PaidFor = s.PaidFor,
        //                Note = s.Note,
        //                IsFixed = s.IsFixed,
        //                ExtraData = s.ExtraData,
        //                Date = new DateTime(year, month, day),
        //                Month = month,
        //                Year = year
        //            });
        //        }

        //        if (monthHasData && !toInsert.Any(e => e.Month == month))
        //        {
        //            skippedMonths.Add($"{MonthNames[month - 1]} {year}");
        //        }
        //    }

        //    if (!toInsert.Any())
        //        return (false, skippedMonths.Any() ? $"All target months already have data: {string.Join(", ", skippedMonths)}" : "No new data to copy.");

        //    using var tx = await _context.Database.BeginTransactionAsync();
        //    try
        //    {
        //        _context.Expenses.AddRange(toInsert);
        //        await _context.SaveChangesAsync();
        //        await tx.CommitAsync();

        //        string message = skippedMonths.Any()
        //            ? $"Copied successfully. Skipped months with existing data: {string.Join(", ", skippedMonths)}"
        //            : "Copied successfully to all target months.";

        //        return (true, message);
        //    }
        //    catch
        //    {
        //        await tx.RollbackAsync();
        //        throw;
        //    }
        //}

        public async Task<(bool Success, string Message)> CopyExpensesFromSourceMonthToTargets(CopyItemsByRangeDateDto dto)
        {
            var sourceFixed = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == dto.UserId
                            && e.Month == dto.SourceMonth
                            && e.Year == dto.SourceYear
                            && e.IsFixed)
                .ToListAsync();

            if (!sourceFixed.Any())
                return (false, "No data found in the source month.");

            var targets = GetMonthsInRange(dto.TargetFromMonth, dto.TargetToMonth)
                .Where(m => !(m.Year == dto.SourceYear && m.Month == dto.SourceMonth))
                .ToList();

            if (!targets.Any())
                return (false, "No valid target months.");

            var targetYears = targets.Select(t => t.Year).ToHashSet();
            var targetMonths = targets.Select(t => t.Month).ToHashSet();

            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1 — Remove existing fixed expenses in target months
                var existingFixed = await _context.Expenses
                    .Where(e => e.UserId == dto.UserId
                                && e.IsFixed
                                && targetYears.Contains(e.Year)
                                && targetMonths.Contains(e.Month))
                    .ToListAsync();

                if (existingFixed.Any())
                    _context.Expenses.RemoveRange(existingFixed);

                // 2 — Prepare new expenses
                var toInsert = new List<Expense>();

                foreach (var (year, month) in targets)
                {
                    foreach (var s in sourceFixed)
                    {
                        var day = Math.Min(
                            s.Date.Day,
                            DateTime.DaysInMonth(year, month)
                        );

                        toInsert.Add(new Expense
                        {
                            Id = Guid.NewGuid(),
                            UserId = s.UserId,
                            CategoryId = s.CategoryId,
                            SubCategoryId = s.SubCategoryId,
                            PlaceId = s.PlaceId,
                            ItemName = s.ItemName,
                            Amount = s.Amount,
                            PaidFor = s.PaidFor,
                            Note = s.Note,
                            IsFixed = s.IsFixed,
                            ExtraData = s.ExtraData,
                            Date = new DateTime(year, month, day),
                            Month = month,
                            Year = year
                        });
                    }
                }

                // 3 — Insert new data
                _context.Expenses.AddRange(toInsert);

                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                return (true, $"Copied successfully to {targets.Count} months.");
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
        private static void LogError(Exception ex, string userId, int month, int year, string method)
        {
            Console.WriteLine($"[ExpenseService] Error in {method} for user {userId}, month {month}, year {year}: {ex.Message}");
        }
    }
}
