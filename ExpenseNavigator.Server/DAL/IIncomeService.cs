using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.ExpenseNavigatorAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Interfaces
{
    public interface IIncomeService
    {
        Task<Income> GetIncomeById(int id);
        Task<IEnumerable<Income>> GetAllIncomes(string userId);
        Task<Income> AddIncome(Income income);
        Task<Income> UpdateIncome(Income income);
        Task<bool> DeleteIncome(string id);
        Task<bool> DeleteAllIncomes(string userId);
        Task<Income> DuplicateIncome(int id);
        Task<IEnumerable<Income>> GetIncomesByMonth(string userId, int month, int year);
        Task<IEnumerable<Income>> GenerateNextMonth(string userId, int currentMonth, int currentYear);
        Task<bool> CopyIncomesByRangeAsync(CopyItemsByRangeDateDto obj);

    }
}
