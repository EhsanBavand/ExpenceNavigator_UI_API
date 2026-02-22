using ExpenseNavigatorAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(string userId, int month, int year);
        Task<CategoryDto> GetCategoryByIdAsync(Guid id, string userId, int month, int year);

        Task<CategoryDto> AddUserCategoryAsync(string userId, string name, decimal budget, bool isRecurring);
        Task<CategoryDto> UpdateUserCategoryAsync(CategoryDto dto);
        Task<bool> DeleteUserCategoryAsync(Guid categoryId, string userId, int month, int year);
        Task<(bool Success, string Message)> CopyBudgetFromSourceMonthToTargets(CopyItemsByRangeDateDto obj);

        //    Task<IEnumerable<UserCategoryBudget>> GetBudgetsForMonthAsync(string userId, int month, int year);
        //    Task GenerateNextMonthBudgetsAsync(string userId, int month, int year);

    }

}
