using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;

namespace ExpenseNavigatorAPI.DAL
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetMonthlySummaryAsync(string userId, int month, int year);
        Task<List<CategoryBudgetDto>> GetUserCategoryBudgetsAsync(string userId, int month, int year);
        Task<List<SubCategoryDto>> GetSubCategoriesByCategory(string catId, string userId, int month, int year);
        Task<List<MonthlySummaryDto>> GetMonthlySummaryAsync(string userId, int year);
    }
}
