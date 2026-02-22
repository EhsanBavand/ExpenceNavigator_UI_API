using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Models.Dashboard;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavingController : Controller
    {

        private readonly ISavingService _service;

        public SavingController(ISavingService service)
        {
            _service = service;
        }

        [HttpGet("{userId}/{year:int}")]
        public async Task<IActionResult> GetAll(string userId, int year)
        {
            var savings = _service.GetAllSavingAsync(userId, year); // await it
            return Ok(savings); // real data
        }

        [HttpGet("ExtraMoneyByYear")]
        public async Task<ActionResult> GetExtraMoneyByYear( [FromQuery]string userId, [FromQuery]int year)
        {
            if (year <= 0)
                return BadRequest("Invalid year.");

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var data = await _service.GetExtraMoneyPerYear(userId, year);
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] SavingDto saving)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await _service.AddSaving(saving);
            if (!result) return StatusCode(StatusCodes.Status500InternalServerError, "Could not add saving.");

            return Ok(true);
        }

       
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSavingRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (string.IsNullOrEmpty(request.UserId ))
                return BadRequest("UserId is required.");

            var ok = await _service.UpdateSavingAsync(id, request.UserId, request);
            if (!ok) return NotFound("Saving not found or not owned by user.");

            return Ok(true);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id, [FromQuery] string userId)
        {
            if ( string.IsNullOrEmpty(userId))
                return BadRequest("UserId is required.");

            var ok = await _service.DeleteSavingAsync(id, userId);
            if (!ok) return NotFound("Saving not found or not owned by user.");

            return Ok(true);
        }



    }
}
