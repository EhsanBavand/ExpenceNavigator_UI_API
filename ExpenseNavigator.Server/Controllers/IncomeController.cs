using ExpenseNavigatorAPI.Interfaces;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.ExpenseNavigatorAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncomeController : ControllerBase
    {
        private readonly IIncomeService _incomeService;

        public IncomeController(IIncomeService incomeService)
        {
            _incomeService = incomeService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var income = await _incomeService.GetIncomeById(id);
            if (income == null) return NotFound();
            return Ok(income);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAll(string userId)
        {
            var incomes = await _incomeService.GetAllIncomes(userId);
            return Ok(incomes);
        }
        
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Income income)
        {
            var result = await _incomeService.AddIncome(income);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] Income income)
        {

            var updated = await _incomeService.UpdateIncome(income);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _incomeService.DeleteIncome(id);
            if (!success) return NotFound();
            return Ok();
        }

        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteAll(string userId)
        {
            var success = await _incomeService.DeleteAllIncomes(userId);
            return Ok(success);
        }

        [HttpPost("duplicate/{id}")]
        public async Task<IActionResult> Duplicate(int id)
        {
            var newIncome = await _incomeService.DuplicateIncome(id);
            if (newIncome == null) return NotFound();
            return Ok(newIncome);
        }

        [HttpGet("by-month")]
        public async Task<IActionResult> GetByMonth(string userId, int month, int year)
        {
            var incomes = await _incomeService.GetIncomesByMonth(userId, month, year);
            return Ok(incomes);
        }

        [HttpPost("generate-next-month/{userId}")]
        public async Task<IActionResult> GenerateNextMonth(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Invalid user ID.");

            try
            {
                // Get current month
                var now = DateTime.UtcNow;
                var currentMonth = now.Month;
                var currentYear = now.Year;

                // Call service to generate next month incomes
                var generatedIncomes = await _incomeService.GenerateNextMonth(userId, currentMonth, currentYear);

                return Ok(generatedIncomes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating next month incomes: {ex.Message}");
            }
        }


        [HttpPost("copy-range")]
        public async Task<IActionResult> CopyIncomesByRange([FromBody] CopyItemsByRangeDateDto dto)
        {
            if (dto == null)
                return BadRequest("Payload is missing");

            var result = await _incomeService.CopyIncomesByRangeAsync(dto);

            if (!result)
                return NotFound("No incomes found for the selected source month/year.");

            return Ok(new { message = "Incomes copied successfully." });
        }

    }
}
