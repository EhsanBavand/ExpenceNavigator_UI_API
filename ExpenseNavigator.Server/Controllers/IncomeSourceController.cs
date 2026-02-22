using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ExpenseNavigatorAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncomeSourceController : ControllerBase
    {
        private readonly IIncomeSourceService _service;

        public IncomeSourceController(IIncomeSourceService service)
        {
            _service = service;
        }

        [HttpGet("by-id/{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            if (!Guid.TryParse(id, out var guid))
                return BadRequest("Invalid Guid format.");

            var source = await _service.GetSourceById(guid);
            if (source == null) return NotFound();
            return Ok(source);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAll(string userId)
        {
            var sources = await _service.GetAllSources(userId);
            return Ok(sources);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] IncomeSource source)
        {
            var added = await _service.AddSource(source);
            return CreatedAtAction(nameof(GetById), new { id = added.Id }, added);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!Guid.TryParse(id, out var guid))
                return BadRequest("Invalid Guid format.");

            var deleted = await _service.DeleteSource(guid);
            if (!deleted) return NotFound();
            return NoContent();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] IncomeSource source)
        {
            if (!Guid.TryParse(id, out var guid))
                return BadRequest("Invalid Guid format.");

            var updated = await _service.UpdateSource(guid, source);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

    }
}
