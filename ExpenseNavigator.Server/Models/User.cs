using ExpenseNavigatorAPI.Models.ExpenseNavigatorAPI.Models;
using System;
using System.Collections.Generic;

namespace ExpenseNavigatorAPI.Models
{
    public class User
    {
        public string Id { get; set; }  // Guid or string depending on your auth system
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; } // Do NOT store plain passwords
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Place> Places { get; set; } = new List<Place>();
        public ICollection<Income> Incomes { get; set; } = new List<Income>();
        public ICollection<IncomeSource> IncomeSources { get; set; } = new List<IncomeSource>();
    }
}
