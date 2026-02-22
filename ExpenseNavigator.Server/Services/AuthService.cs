using ExpenseNavigator.Interfaces;
using ExpenseNavigatorAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ExpenseNavigator.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<IdentityUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterModel model)
        {
            try
            {
                var user = new IdentityUser
                {
                    UserName = model.Username,
                    Email = model.Email
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    return new AuthResponse
                    {
                        IsAuthenticated = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                return new AuthResponse
                {
                    IsAuthenticated = true,
                    Message = "User registered successfully"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    IsAuthenticated = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginModel model)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(model.Username);
                if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    return new AuthResponse
                    {
                        IsAuthenticated = false,
                        Message = "Invalid username or password"
                    };
                }

                var token = GenerateJwtToken(user);

                return new AuthResponse
                {
                    IsAuthenticated = true,
                    Token = token,
                    Message = "Login successful",
                    UserId = user.Id,
                    Username = user.UserName,
                    Email = user.Email
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    IsAuthenticated = false,
                    Message = $"Login failed: {ex.Message}"
                };
            }
        }


        // Replace the parameter type of GenerateJwtToken from ApplicationUser to IdentityUser
        private string GenerateJwtToken(IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),                // UserId
                new Claim(ClaimTypes.NameIdentifier, user.Id),                 // UserId
                new Claim(ClaimTypes.Name, user.UserName),                     // Username
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
                // Add roles or other claims if needed
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryMinutes"]));

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

}

