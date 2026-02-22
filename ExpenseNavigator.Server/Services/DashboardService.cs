using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;
using Microsoft.EntityFrameworkCore;
using System.Collections.Immutable;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<DashboardSummaryDto> GetMonthlySummaryAsync(string userId, int month, int year)
    {
        var result = await _context.DashboardSummary
            .FromSqlInterpolated($"EXEC dbo.sp_GetCategoryBudgetSummery @UserId={userId}, @Month={month}, @Year={year}")
            .AsNoTracking()
            .ToListAsync();
        return result.FirstOrDefault() ?? new DashboardSummaryDto();
    }
    public async Task<List<CategoryBudgetDto>> GetUserCategoryBudgetsAsync(string userId, int month, int year)
    {
        var budgetsQuery = _context.UserCategoryBudget
            .Where(b => b.UserId == userId && b.IsActive && b.Year == year);

        var expensesQuery = _context.Expenses
            .Where(e => e.UserId == userId && e.Year == year);

        if (month != 0)
        {
            budgetsQuery = budgetsQuery.Where(b => b.Month == month);
            expensesQuery = expensesQuery.Where(e => e.Month == month);
        }

        var budgets = await budgetsQuery.ToListAsync();
        var categories = await _context.Categories
            .Where(c => c.UserId == userId && c.IsActive)
            .ToListAsync();
        var expenses = await expensesQuery.ToListAsync();

        var result = new List<CategoryBudgetDto>();

        foreach (var category in categories)
        {
            var budget = budgets
                .Where(b => b.CategoryId == category.Id)
                .Sum(b => b.Budget);   // 👈 important for yearly

            var totalExpense = expenses
                .Where(e => e.CategoryId == category.Id)
                .Sum(e => e.Amount);

            if (budget == 0 && totalExpense == 0)
                continue;

            result.Add(new CategoryBudgetDto
            {
                CategoryId = category.Id,
                CategoryName = category.Name,
                Budget = budget,
                TotalExpense = totalExpense
            });
        }

        return result;
    }
    public async Task<List<SubCategoryDto>> GetSubCategoriesByCategory(string catId, string userId, int month, int year)
    {
        var categoryId = Guid.Parse(catId);

        var result = await _context.SubCategoryDtos
                          .FromSqlInterpolated($@"EXEC dbo.sp_GetSubCategoryExpenses @CategoryId = {categoryId},@UserId = {userId},@Month = {month},@Year = {year}").ToListAsync();

        return result;
    }
    public async Task<List<MonthlySummaryDto>> GetMonthlySummaryAsync(string userId, int year)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("userId is required", nameof(userId));

        // Base 12 months
        var months = Enumerable.Range(1, 12).Select(m => new MonthlySummaryDto { Year = year, Month = m }).ToList();

        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("userId is required", nameof(userId));


        var expenseByMonth = await _context.Expenses
            .Where(e => e.UserId == userId && e.Year == year)
            .GroupBy(e => e.Month)
            .Select(g => new { Month = g.Key, Sum = g.Sum(x => x.Amount) })
            .ToDictionaryAsync(x => x.Month, x => x.Sum);


        var incomeByMonth = await _context.Incomes
            .Where(i => i.UserId == userId && i.Year == year)
            .GroupBy(i => i.Month)
            .Select(g => new { Month = g.Key, Sum = g.Sum(x => x.Amount) })
            .ToDictionaryAsync(x => x.Month, x => x.Sum);

        var budgets = await _context.UserCategoryBudget
            .Where(b => b.UserId == userId && b.IsActive && b.Year == year)
            .GroupBy(i => i.Month)
            .Select(g => new { Month = g.Key, Sum = g.Sum(x => x.Budget) })
            .ToDictionaryAsync(x => x.Month, x => x.Sum);

        foreach (var m in months)
        {
            m.Expense = expenseByMonth.TryGetValue(m.Month, out var exp) ? exp : 0m;
            m.Income = incomeByMonth.TryGetValue(m.Month, out var inc) ? inc : 0m;
            m.Budget = budgets.TryGetValue(m.Month, out var bdg) ? bdg : 0m;
        }

        return months;
    }






}

