namespace ExpenseNavigatorAPI.Models
{
    public class BudgetRequestDto
    {
        public string UserId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal Budget { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public bool IsRecurring { get; set; } = true;
    }
}
