using ExpenseNavigatorAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Services
{
    public interface IIncomeSourceService
    {
        Task<IncomeSource> GetSourceById(Guid id);
        Task<IEnumerable<IncomeSource>> GetAllSources(string userId);
        Task<IncomeSource> AddSource(IncomeSource source);
        Task<IncomeSource> UpdateSource(Guid id, IncomeSource source);
        Task<bool> DeleteSource(Guid id);
        
        
        //Task<List<IncomeSource>> GetSourcesByUser(string userId);

    }
}
