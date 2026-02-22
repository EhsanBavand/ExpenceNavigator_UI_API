using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ExpenseNavigatorAPI.Services
{
    public class SubCategoryService : ISubCategoryService
    {
        private readonly ApplicationDbContext _context;

        public SubCategoryService(ApplicationDbContext context)
        {
            _context = context;
        }
        public IEnumerable<SubCategory> GetAllSubCategories(string userId)
        {
            try
            {
                var subCategory = _context.SubCategories.Where(u => u.UserId == userId).ToList().OrderByDescending(s => s.IsActive).ThenBy(s => s.Name);
                return subCategory;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to get all subcategories.", ex);
            }
        }
        public SubCategory? GetSubCategoryById(Guid id)
        {
            try
            {
                var subCategory = _context.SubCategories.FirstOrDefault(sc => sc.Id == id && sc.IsActive);
                return subCategory;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to get subcategory with Id {id}.", ex);
            }
        }
        public SubCategory AddSubCategory(SubCategory subCategory)
        {
            try
            {
                subCategory.Id = Guid.NewGuid();
                subCategory.CreatedDate = DateTime.UtcNow;
                subCategory.IsActive = true;
                subCategory.IsRecurring = subCategory.IsRecurring;

                _context.SubCategories.Add(subCategory);
                _context.SaveChanges();

                return subCategory;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to add subcategory.", ex);
            }
        }
        public SubCategory UpdateSubCategory(SubCategory subCategory)
        {
            try
            {
                var existing = _context.SubCategories.Find(subCategory.Id);
                if (existing == null) return null;

                existing.Name = subCategory.Name;
                existing.CategoryId = subCategory.CategoryId;
                existing.IsRecurring = subCategory.IsRecurring;
                existing.IsActive = subCategory.IsActive;

                _context.SaveChanges();
                return existing;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to update subcategory with Id {subCategory.Id}.", ex);
            }
        }
        public bool DeleteSubCategory(Guid id)
        {
            try
            {
                var subCategory = _context.SubCategories.Find(id);
                if (subCategory == null) return false;

                subCategory.IsActive = false;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete subcategory with Id {id}.", ex);
            }
        }
        public IEnumerable<SubCategory> GetSubCategoriesByCategoryId(Guid categoryId)
        {
            try
            {
                return _context.SubCategories.Where(sc => sc.CategoryId == categoryId && sc.IsActive).OrderBy(s => s.Name).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to get subcategories for category Id {categoryId}.", ex);
            }
        }
    }
}
