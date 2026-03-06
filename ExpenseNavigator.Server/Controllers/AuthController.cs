using ExpenseNavigator.Interfaces;
using ExpenseNavigator.Server.Models;
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
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            var result = await _authService.ForgotPasswordAsync(model.Email);

            if (!result.IsAuthenticated)
                return BadRequest(new { message = result.Message });

            return Ok(result);
        }
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            var result = await _authService.ResetPasswordAsync(model);

            if (!result.IsAuthenticated)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

    }

}
