namespace ExpenseNavigatorAPI.Models.Dashboard
{
    public class DashboardSummaryDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingIncome { get; set; }
        public decimal RemainingBudget { get; set; }

    }
}
