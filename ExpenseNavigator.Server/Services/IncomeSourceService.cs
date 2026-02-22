using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Services
{
    public class IncomeSourceService : IIncomeSourceService
    {
        private readonly ApplicationDbContext _context;

        public IncomeSourceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IncomeSource> GetSourceById(Guid id)
        {
            return await _context.IncomeSources.FindAsync(id);
        }
        public async Task<IEnumerable<IncomeSource>> GetAllSources(string userId)
        {
            return await _context.IncomeSources
                .Where(s => s.UserId == userId && s.IsActive)  
                .OrderBy(s => s.CreatedDate)
                .ToListAsync();
        }
        public async Task<IncomeSource> AddSource(IncomeSource source)
        {
            source.Id = Guid.NewGuid();
            source.CreatedDate = DateTime.UtcNow;
            source.ModifiedDate = DateTime.UtcNow;
            source.IsActive = true;   // new source always active

            _context.IncomeSources.Add(source);
            await _context.SaveChangesAsync();
            return source;
        }

        public async Task<IncomeSource> UpdateSource(Guid id, IncomeSource source)
        {
            var existing = await _context.IncomeSources.FindAsync(id);
            if (existing == null || !existing.IsActive) return null;

            existing.Name = source.Name;
            existing.Description = source.Description;
            existing.ModifiedDate = DateTime.UtcNow;

            // Update all related incomes' SourceType
            var relatedIncomes = _context.Incomes
                .Where(i => i.IncomeSourceId == id);

            foreach (var income in relatedIncomes)
            {
                income.SourceType = source.Name;
                income.ModifiedDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteSource(Guid id)
        {
            var source = await _context.IncomeSources.FindAsync(id);
            if (source == null) return false;

            // ❗ Soft Delete — DO NOT remove from DB
            source.IsActive = false;
            source.ModifiedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
