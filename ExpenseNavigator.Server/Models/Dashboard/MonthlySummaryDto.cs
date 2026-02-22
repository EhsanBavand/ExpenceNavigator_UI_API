namespace ExpenseNavigatorAPI.Models.Dashboard
{
    public class MonthlySummaryDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal? Expense { get; set; }
        public decimal? Budget { get; set; }
        public decimal? Income { get; set; }
    }

}
