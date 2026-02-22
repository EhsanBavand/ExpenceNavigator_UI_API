using ExpenseNavigator.Interfaces;
using ExpenseNavigatorAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ExpenseNavigator.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var result = await _authService.RegisterAsync(model);
            if (!result.IsAuthenticated)
                return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var result = await _authService.LoginAsync(model);
            if (!result.IsAuthenticated)
                return BadRequest(new { message = result.Message });

            return Ok(result); 
        }

    }

}
