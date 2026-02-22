using System;
using System.Threading.Tasks;
using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpenseController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        // GET: api/expense/{userId}/{month}/{year}
        [HttpGet("{userId}/{month:int}/{year:int}")]
        public async Task<IActionResult> GetAll(string userId, int month, int year)
        {
            var expenses = await _expenseService.GetAllAsync(userId, month, year);
            return Ok(expenses);
        }

        // GET: api/expense/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var expense = await _expenseService.GetByIdAsync(id);
            if (expense == null) return NotFound();
            return Ok(expense);
        }

        // POST: api/expense
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] ExpenseDto expenseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var expense = new Expense
            {
                UserId = expenseDto.UserId,
                CategoryId = expenseDto.CategoryId,
                SubCategoryId = expenseDto.SubCategoryId,
                PlaceId = expenseDto.PlaceId,
                Amount = expenseDto.Amount,
                PaidFor = expenseDto.PaidFor,
                ItemName = expenseDto.ItemName,
                Note = expenseDto.Note,
                IsFixed = expenseDto.IsFixed,
                Month = expenseDto.Month,
                Year = expenseDto.Year,
                Date = expenseDto.Date ?? DateTime.UtcNow
            };

            var added = await _expenseService.AddAsync(expense);
            return CreatedAtAction(nameof(GetById), new { id = added.Id }, added);
        }

        // PUT: api/expense/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ExpenseDto expenseDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _expenseService.UpdateAsync(expenseDto, id);
            if (!updated) return NotFound();

            return NoContent();
        }

        // DELETE: api/expense/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _expenseService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        // GET: api/expense/report?month=...&year=...
        [HttpGet("report")]
        public async Task<IActionResult> GetReport([FromQuery] int month, [FromQuery] int year)
        {
            var report = await _expenseService.GetByMonthYearAsync(month, year);
            return Ok(report);
        }

        // POST: api/expense/copy-expense
        [HttpPost("copy-expense")]
        public async Task<IActionResult> CopyExpensesByRange([FromBody] CopyItemsByRangeDateDto dto)
        {
            if (dto == null)
                return BadRequest("Payload is missing");

            // Deconstruct tuple
            var (success, message) = await _expenseService.CopyExpensesFromSourceMonthToTargets(dto);

            if (!success)
                return NotFound(message); 

            return Ok(new { message }); 
        }

    }
}
