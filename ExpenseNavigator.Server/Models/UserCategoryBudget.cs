namespace ExpenseNavigatorAPI.Models
{
    public class UserCategoryBudget
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal Budget { get; set; }
        public int Month { get; set; }   
        public int Year { get; set; }
        public bool IsRecurring { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public Category Category { get; set; }
    }

}
