using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubCategoryController : ControllerBase
    {
        private readonly ISubCategoryService _service;

        public SubCategoryController(ISubCategoryService service)
        {
            _service = service;
        }

        [HttpGet] 
        public IActionResult GetAll([FromQuery] string userId)
        {
            var subCategories = _service.GetAllSubCategories(userId); 
            return Ok(subCategories);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var subCategory = _service.GetSubCategoryById(id);
            if (subCategory == null) return NotFound();
            return Ok(subCategory);
        }

        [HttpGet("by-category/{categoryId}")]
        public IActionResult GetByCategory(Guid categoryId)
        {
            var subCategories = _service.GetSubCategoriesByCategoryId(categoryId);
            return Ok(subCategories);
        }

        [HttpPost]
        public IActionResult Add([FromBody] SubCategory subCategory)
        {
            var result = _service.AddSubCategory(subCategory);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, [FromBody] SubCategory subCategory)
        {
            if (id != subCategory.Id) return BadRequest("ID mismatch");
            var updated = _service.UpdateSubCategory(subCategory);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var success = _service.DeleteSubCategory(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
