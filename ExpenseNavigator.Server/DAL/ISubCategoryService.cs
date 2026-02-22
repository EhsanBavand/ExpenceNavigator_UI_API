using ExpenseNavigatorAPI.Models;
using System;
using System.Collections.Generic;

namespace ExpenseNavigatorAPI.Services
{
    public interface ISubCategoryService
    {
        IEnumerable<SubCategory> GetAllSubCategories(string userId);
        SubCategory GetSubCategoryById(Guid id);
        SubCategory AddSubCategory(SubCategory subCategory);
        SubCategory UpdateSubCategory(SubCategory subCategory);
        bool DeleteSubCategory(Guid id);
        IEnumerable<SubCategory> GetSubCategoriesByCategoryId(Guid categoryId);
    }
}
