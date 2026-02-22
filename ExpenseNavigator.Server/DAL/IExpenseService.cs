using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseNavigatorAPI.Models;

namespace ExpenseNavigatorAPI.DAL
{
    public interface IExpenseService
    {
        Task<List<Expense>> GetAllAsync(string userId, int month, int year);
        Task<Expense?> GetByIdAsync(Guid id);
        Task<Expense> AddAsync(Expense dto);
        Task<bool> UpdateAsync(ExpenseDto dto, Guid id);
        Task<bool> DeleteAsync(Guid id);
        Task<List<Expense>> GetByMonthYearAsync(int month, int year);
        Task<(bool Success, string Message)> CopyExpensesFromSourceMonthToTargets(CopyItemsByRangeDateDto obj);
    }
}
