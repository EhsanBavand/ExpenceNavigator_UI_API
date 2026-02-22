
using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet("{userId}/{month:int}/{year:int}")]
        public async Task<IActionResult> GetAll(string userId, int month, int year)
        {
            var categories = await _service.GetAllCategoriesAsync(userId, month, year);
            return Ok(categories);
        }

        [HttpGet("{userId}/category/{id:guid}/{month:int}/{year:int}")]
        public async Task<IActionResult> GetCategoryById(string userId, Guid id, int month, int year)
        {
            var category = await _service.GetCategoryByIdAsync(id, userId, month, year);
            if (category == null) return NotFound();
            return Ok(category);
        }

        //[HttpPost]
        //public async Task<IActionResult> AddCategory(string userId, string name, decimal budget, bool isRecurring)
        [HttpPost("{userId}/{name}/{budget}/{isRecurring}")]
        public async Task<IActionResult> AddCategoryRoute(string userId,string name,decimal budget,bool isRecurring)
        {            
            var created = await _service.AddUserCategoryAsync(userId, name, budget, isRecurring);
            return Ok(created);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryDto dto)
        {
            if (dto == null)
                return BadRequest("Category data is required.");

            var updated = await _service.UpdateUserCategoryAsync(dto);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id, string userId, int month, int year)
        {
            var deleted = await _service.DeleteUserCategoryAsync(id, userId, month, year);
            if (!deleted) return NotFound();

            return Ok(true);
        }

        [HttpPost("copy-categorybudget")]
        public async Task<IActionResult> CopyCategoryBudget([FromBody] CopyItemsByRangeDateDto dto)
        {
            var (success, message) = await _service.CopyBudgetFromSourceMonthToTargets(dto);

            if (!success)
                return NotFound(message);

            return Ok(new { message });  
        }
    }
}

