using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ExpenseNavigatorAPI.Models
{
    public class SubCategory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public string Name { get; set; }
        public DateTime? CreatedDate { get; set; }
        
        [Required]
        public Guid CategoryId { get; set; }
        
        [JsonIgnore]
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public bool IsActive { get; set; }
        public bool IsRecurring { get; set; }
        public string UserId { get; set; }

    }
}
