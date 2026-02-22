using System.ComponentModel.DataAnnotations;

namespace ExpenseNavigatorAPI.Models
{
    public class IncomeSource
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool IsActive { get; set; }
    }
}
