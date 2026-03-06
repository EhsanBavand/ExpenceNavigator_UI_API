using Microsoft.AspNetCore.Mvc;
using ExpenseNavigator.Interfaces;
using System.Threading.Tasks;

namespace ExpenseNavigator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestEmailController : ControllerBase
    {
        private readonly ITestEmailService _testEmailService;

        public TestEmailController(ITestEmailService testEmailService)
        {
            _testEmailService = testEmailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] TestEmailRequest request)
        {
            var result = await _testEmailService.SendTestEmailAsync(request.Email);
            return Ok(new { message = result });
        }
    }

    public class TestEmailRequest
    {
        public string Email { get; set; }
    }
}