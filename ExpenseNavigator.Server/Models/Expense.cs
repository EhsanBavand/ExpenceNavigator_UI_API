using System.Text.Json.Serialization;

namespace ExpenseNavigatorAPI.Models
{
    public class Expense
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid? SubCategoryId { get; set; }
        public Guid? PlaceId { get; set; }
        public string? ItemName { get; set; }
        public decimal Amount { get; set; }
        public string? PaidFor { get; set; }
        public string? Note { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public bool IsFixed { get; set; } = false;
        public string? ExtraData { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        [JsonIgnore] public Category Category { get; set; }
        [JsonIgnore] public SubCategory SubCategory { get; set; }
        [JsonIgnore] public Place? Place { get; set; }
    }
    public class ExpenseDto
    {
        public string UserId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid? SubCategoryId { get; set; }
        public Guid? PlaceId { get; set; }
        public string? ItemName { get; set; }
        public decimal Amount { get; set; }
        public string? PaidFor { get; set; }
        public string? Note { get; set; }
        public bool IsFixed { get; set; } = false;
        public DateTime? Date { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

    }
}
