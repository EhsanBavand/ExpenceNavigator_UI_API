using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;
using ExpenseNavigatorAPI.Models.ExpenseNavigatorAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace ExpenseNavigatorAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Income> Incomes { get; set; }
        public DbSet<IncomeSource> IncomeSources { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Place> Places { get; set; }
        public DbSet<UserCategoryBudget> UserCategoryBudget { get; set; }
        public DbSet<DashboardSummaryDto> DashboardSummary { get; set; } 
        public DbSet<SubCategoryDto> SubCategoryDtos { get; set; }
        public DbSet<Saving> Savings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Just for Dashboard summery 
            builder.Entity<DashboardSummaryDto>().HasNoKey(); // mark DTO as keyless

            // Required fields
            builder.Entity<SubCategory>()
                .Property(s => s.CategoryId)
                .IsRequired();

            // Decimal precision
            //builder.Entity<Category>().Property(c => c.Budget).HasColumnType("decimal(18,2)");
            builder.Entity<Expense>().Property(e => e.Amount).HasColumnType("decimal(18,2)");
            builder.Entity<Income>().Property(i => i.Amount).HasColumnType("decimal(18,2)");
            builder.Entity<UserCategoryBudget>().Property(u => u.Budget).HasColumnType("decimal(18,2)");

            // Expense relationships
            builder.Entity<Expense>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Expense>()
                .HasOne(e => e.SubCategory)
                .WithMany(s => s.Expenses)
                .HasForeignKey(e => e.SubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Place relationships
            builder.Entity<Place>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<DashboardSummaryDto>(entity =>
            {
                entity.HasNoKey();
                entity.ToView(null); 
            });
            builder.Entity<SubCategoryDto>(entity =>
            {
                entity.HasNoKey();
                entity.ToView(null);
            });

        }
    }    
}
