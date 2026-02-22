using System;
using System.Collections.Generic;

namespace ExpenseNavigatorAPI.Models
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public string? UserId { get; set; }
        public ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public ICollection<Place> Places { get; set; } = new List<Place>();
        public ICollection<UserCategoryBudget> Budgets { get; set; } = new List<UserCategoryBudget>();

    }
    public class CategoryDto
    {
        public string UserId { get; set; }
        public string CatId { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public decimal Budget { get; set; }  
        public bool IsRecurring { get; set; }
        public int Month { get; set; }       
        public int Year { get; set; }        
    }

}
