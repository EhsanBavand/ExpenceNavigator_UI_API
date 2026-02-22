using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;

namespace ExpenseNavigatorAPI.DAL
{
    public interface ISavingService
    {
        Task<decimal> GetExtraMoneyPerYear(string userId, int year);
        Task<bool> AddSaving(SavingDto model);
        IEnumerable<SavingDto> GetAllSavingAsync(string userId, int year);
        Task<bool> UpdateSavingAsync(Guid id, string userId, UpdateSavingRequest request);
        Task<bool> DeleteSavingAsync(Guid id, string userId);

    }
}
