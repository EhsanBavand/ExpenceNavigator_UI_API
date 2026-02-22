using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace ExpenseNavigatorAPI.Services
{
    public class SavingService : ISavingService
    {
        // 227cfa2e-a7b9-424b-9672-21feeddf708d

        private readonly ApplicationDbContext _context;
        private readonly ILogger<SavingService> _logger;
        public SavingService(ApplicationDbContext context, ILogger<SavingService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        }

        public IEnumerable<SavingDto> GetAllSavingAsync(string userId, int year)
        {
            if (!Guid.TryParse(userId, out var userGuid))
                throw new ArgumentException("Invalid userId (must be a GUID).", nameof(userId));
            if (year < 2000 || year > 2100)
                throw new ArgumentOutOfRangeException(nameof(year), "Year must be between 2000 and 2100.");
            var savings =  _context.Savings.Where(s => s.UserId == userId && s.Year == year).ToList();
            var result = new List<SavingDto>();
            if (savings.Count() > 0)
            {
                foreach (var saving in savings)
                {
                    result.Add(new SavingDto
                    {
                        Id = saving.Id,
                        Source = saving.Source,
                        Balance = saving.Balance, 
                        Target = saving.Target,
                        Type = saving.Type,
                        CreatedDate = saving.CreatedDate,
                        Year = saving.Year,
                        UserId = saving.UserId,
                    });
                }
            }
            return result.OrderBy(s => s.Type).ToList();
        }
        public async Task<decimal> GetExtraMoneyPerYear(string userId, int year)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("userId is required", nameof(userId));

            if (year < 2000 || year > 2100)
                throw new ArgumentOutOfRangeException(nameof(year), "Year must be between 2000 and 2100.");

            var income = await _context.Incomes
                .AsNoTracking()
                .Where(i => i.UserId == userId && i.Year == year)
                .SumAsync(i => (decimal?)i.Amount) ?? 0m;

            var expense = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.Year == year)
                .SumAsync(e => (decimal?)e.Amount) ?? 0m;

            var saving = await _context.Savings
                .AsNoTracking()
                .Where(e => e.UserId.ToString().ToUpper() == userId.ToUpper() && e.Year == year)
                .SumAsync(e => (decimal?)e.Balance) ?? 0m;

            var result = income - expense - saving;
            return result;
        }
        public async Task<bool> AddSaving(SavingDto obj)
        {
            if (obj is null)
                throw new ArgumentNullException(nameof(obj));
            if (obj.Year < 2000 || obj.Year > 2100)
                throw new ArgumentOutOfRangeException(nameof(obj.Year), "Year must be between 2000 and 2100.");
            if (!string.IsNullOrWhiteSpace(obj.Source))
                obj.Source = obj.Source.Trim();

            var createdDate = obj.CreatedDate == default ? DateTime.UtcNow : DateTime.SpecifyKind(obj.CreatedDate, DateTimeKind.Utc);

            var model = new Saving
            {
                Id = Guid.NewGuid(),
                Source = obj.Source,
                Balance = obj.Balance,
                Target = obj.Target,
                Type = obj.Type,
                CreatedDate = createdDate,
                Year = obj.Year,
                UserId = obj.UserId
            };

            try
            {
                await _context.Savings.AddAsync(model);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Failed to add Saving {@Model}", model);
                throw; // surface to controller for proper status code
            }
        }
        public async Task<bool> UpdateSavingAsync(Guid id, string userId, UpdateSavingRequest req)
        {
            var entity = await _context.Savings
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (entity == null)
                return false;

            entity.Source = req.Source?.Trim() ?? entity.Source;
            entity.Balance = req.Balance;
            entity.Target = req.Target;
            entity.Type = req.Type;
            entity.Year = req.Year;

            _context.Savings.Update(entity);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteSavingAsync(Guid id, string userId)
        {
            var entity = await _context.Savings.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (entity == null) return false;

            _context.Savings.Remove(entity);
            var saved = await _context.SaveChangesAsync();
            return saved > 0;
        }






    }
}
