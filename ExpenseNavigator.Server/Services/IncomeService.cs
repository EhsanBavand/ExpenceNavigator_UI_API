using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Interfaces;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using static ExpenseNavigatorAPI.Helper.HelperExtention;


namespace ExpenseNavigatorAPI.Services
{
    public class IncomeService : IIncomeService
    {
        private readonly ApplicationDbContext _context;

        public IncomeService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<Income> GetIncomeById(int id)
        {
            try
            {
                return await _context.Incomes.FindAsync(id);
            }
            catch (Exception)
            {
                // Log exception here
                return null;
            }
        }
        public async Task<IEnumerable<Income>> GetAllIncomes(string userId)
        {
            try
            {
                return await _context.Incomes
                    .Where(i => i.UserId == userId)
                    .OrderByDescending(i => i.Date)
                    .ToListAsync();
            }
            catch (Exception)
            {
                // Log exception here
                return Enumerable.Empty<Income>();
            }
        }
        public async Task<Income> AddIncome(Income income)
        {
            income.CreatedDate = DateTime.UtcNow;
            income.ModifiedDate = DateTime.UtcNow;

            var source = await _context.IncomeSources.FindAsync(income.IncomeSourceId);
            if (source != null)
                income.SourceType = source.Name;

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();
            return income;
        }
        public async Task<Income> UpdateIncome(Income income)
        {
            try
            {
                // Find existing income
                var existing = await _context.Incomes.FindAsync(income.Id);
                if (existing == null) return null;

                // Update the linked IncomeSource name for display
                var source = await _context.IncomeSources.FindAsync(income.IncomeSourceId);
                string sourceName = source?.Name ?? existing.SourceType;

                // Update properties
                existing.Amount = income.Amount;
                existing.IncomeSourceId = income.IncomeSourceId;
                existing.SourceType = sourceName; // keep in sync with IncomeSource
                existing.Owner = income.Owner;
                existing.Date = income.Date;
                existing.Month = income.Month;
                existing.Year = income.Year;
                existing.IsEstimated = income.IsEstimated;
                existing.IsRecurring = income.IsRecurring;
                existing.Frequency = income.Frequency;
                existing.Description = income.Description;
                existing.ModifiedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return existing;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine(ex);
                return null;
            }
        }
        public async Task<bool> DeleteIncome(string id)
        {
            try
            {
                var income = await _context.Incomes.FindAsync(Guid.Parse(id));
                //var income = await _context.Incomes.FindAsync(Guid.Parse(id));
                if (income == null) return false;

                _context.Incomes.Remove(income);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                // Log exception here
                return false;
            }
        }
        public async Task<bool> DeleteAllIncomes(string userId)
        {
            try
            {
                var incomes = _context.Incomes.Where(i => i.UserId == userId);
                _context.Incomes.RemoveRange(incomes);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                // Log exception here
                return false;
            }
        }
        public async Task<Income> DuplicateIncome(int id)
        {
            try
            {
                var income = await GetIncomeById(id);
                if (income == null || !income.IsRecurring || income.Frequency == RecurrenceFrequency.None)
                    return null;

                // Calculate next date based on frequency
                DateTime nextDate = income.Frequency switch
                {
                    RecurrenceFrequency.Weekly => income.Date.AddDays(7),
                    RecurrenceFrequency.Monthly => income.Date.AddMonths(1),
                    RecurrenceFrequency.Yearly => income.Date.AddYears(1),
                    _ => income.Date
                };

                var newIncome = new Income
                {
                    UserId = income.UserId,
                    Owner = income.Owner,
                    SourceType = income.SourceType,
                    Amount = income.Amount,
                    Date = nextDate,
                    Month = nextDate.Month,
                    Year = nextDate.Year,
                    IsRecurring = income.IsRecurring,
                    IsEstimated = income.IsEstimated,
                    Frequency = income.Frequency,
                    CreatedBy = income.CreatedBy,
                    CreatedDate = DateTime.UtcNow,
                    ModifiedDate = DateTime.UtcNow,
                    Description = income.Description
                };

                _context.Incomes.Add(newIncome);
                await _context.SaveChangesAsync();
                return newIncome;
            }
            catch (Exception)
            {
                // Log exception here
                return null;
            }
        }
        public async Task<IEnumerable<Income>> GetIncomesByMonth(string userId, int month, int year)
        {
            try
            {
                return await _context.Incomes
                    .Where(i => i.UserId == userId && i.Month == month && i.Year == year)
                    .OrderByDescending(i => i.Date)
                    .ToListAsync();
            }
            catch (Exception)
            {
                return Enumerable.Empty<Income>();
            }
        }
        public async Task<IEnumerable<Income>> GenerateNextMonth(string userId, int currentMonth, int currentYear)
        {
            var incomes = await _context.Incomes
                .Where(i => i.UserId == userId && i.Month == currentMonth && i.Year == currentYear && i.IsRecurring)
                .ToListAsync();

            var newIncomes = new List<Income>();

            foreach (var income in incomes)
            {
                // Calculate next date based on frequency
                DateTime nextDate = income.Frequency switch
                {
                    RecurrenceFrequency.Weekly => income.Date.AddDays(7),
                    RecurrenceFrequency.ByWeekly => income.Date.AddDays(14),
                    RecurrenceFrequency.Monthly => income.Date.AddMonths(1),
                    RecurrenceFrequency.Yearly => income.Date.AddYears(1),
                    _ => income.Date
                };

                var newIncome = new Income
                {
                    UserId = income.UserId,
                    Owner = income.Owner,
                    SourceType = income.SourceType,
                    Amount = income.Amount,
                    Date = nextDate,
                    Month = nextDate.Month,
                    Year = nextDate.Year,
                    IsRecurring = income.IsRecurring,
                    IsEstimated = income.IsEstimated,
                    Frequency = income.Frequency,
                    CreatedBy = income.CreatedBy,
                    CreatedDate = DateTime.UtcNow,
                    ModifiedDate = DateTime.UtcNow,
                    Description = income.Description
                };

                newIncomes.Add(newIncome);
            }

            _context.Incomes.AddRange(newIncomes);
            await _context.SaveChangesAsync();

            return newIncomes;
        }
        public async Task<bool> CopyIncomesByRangeAsync(CopyItemsByRangeDateDto dto)
        {
            // Source incomes
            var incomesToCopy = await _context.Incomes
                .Where(i => i.UserId == dto.UserId
                         && i.Month == dto.SourceMonth
                         && i.Year == dto.SourceYear
                         && i.IsRecurring)
                .ToListAsync();

            if (!incomesToCopy.Any())
                return false;

            var targetMonths = GetMonthsInRange(dto.TargetFromMonth, dto.TargetToMonth);

            // Remove source month from targets
            var filteredTargetMonths = targetMonths
                .Where(m => !(m.Year == dto.SourceYear && m.Month == dto.SourceMonth))
                .ToList();

            var copiedIncomes = new List<Income>();

            foreach (var (year, month) in filteredTargetMonths)
            {
                // Remove existing target month data first
                var existingTargetIncomes = await _context.Incomes
                    .Where(i => i.UserId == dto.UserId
                             && i.Month == month
                             && i.Year == year
                             && i.IsRecurring)
                    .ToListAsync();

                if (existingTargetIncomes.Any())
                {
                    _context.Incomes.RemoveRange(existingTargetIncomes);
                }

                // Create new copies
                copiedIncomes.AddRange(incomesToCopy.Select(i =>
                {
                    var maxDay = DateTime.DaysInMonth(year, month);
                    var day = Math.Min(i.Date.Day, maxDay);

                    return new Income
                    {
                        Id = Guid.NewGuid(),
                        UserId = i.UserId,
                        Owner = i.Owner,
                        SourceType = i.SourceType,
                        Amount = i.Amount,
                        Date = new DateTime(year, month, day),
                        Month = month,
                        Year = year,
                        IsRecurring = i.IsRecurring,
                        IsEstimated = i.IsEstimated,
                        Frequency = i.Frequency,
                        Description = i.Description,
                        CreatedBy = i.CreatedBy,
                        CreatedDate = DateTime.UtcNow,
                        ModifiedDate = DateTime.UtcNow,
                        IncomeSourceId = i.IncomeSourceId,
                    };
                }));
            }

            _context.Incomes.AddRange(copiedIncomes);

            await _context.SaveChangesAsync();

            return true;
        }


    }


}
