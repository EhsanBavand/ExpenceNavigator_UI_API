namespace ExpenseNavigatorAPI.Models.Dashboard
{
    public class CategoryBudgetDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; }
        public decimal Budget { get; set; }
        public decimal TotalExpense { get; set; }
    }
}
