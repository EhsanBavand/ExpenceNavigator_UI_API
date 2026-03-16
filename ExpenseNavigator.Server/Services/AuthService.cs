using ExpenseNavigator.Interfaces;
using ExpenseNavigator.Server.Models;
using ExpenseNavigatorAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using SendGrid;
using SendGrid;
using SendGrid.Helpers.Mail;
using SendGrid.Helpers.Mail;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text;
using System.Text;
using System.Text.Encodings.Web;
namespace ExpenseNavigator.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
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
        public async Task<AuthResponse> ForgotPasswordAsync(string email)
        {
            var genericMessage = "If the email exists, a reset link has been sent.";

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return new AuthResponse { IsAuthenticated = true, Message = genericMessage };

            try
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                var frontendBaseUrl = _configuration["Frontend:BaseUrl"];

                var resetLink =
                    $"{frontendBaseUrl}/reset-password" +
                    $"?email={Uri.EscapeDataString(user.Email)}" +
                    $"&token={Uri.EscapeDataString(token)}";

                var apiKey = _configuration["SendGrid:ApiKey"];
                var client = new SendGridClient(apiKey);

                var from = new EmailAddress(
                    _configuration["SendGrid:FromEmail"],
                    "Expense Navigator"
                );

                var to = new EmailAddress(user.Email);

                var subject = "Reset Your Password";

                var plainTextContent =
                    $"Hello {user.UserName},\n\n" +
                    $"Click the link below to reset your password:\n{resetLink}\n\n" +
                    "If you didn’t request this, ignore this email.";

                var htmlContent = $@"
            <p>Hello {System.Net.WebUtility.HtmlEncode(user.UserName)},</p>
            <p>Click the link below to reset your password:</p>
            <p><a href=""{resetLink}"">Reset Password</a></p>
            <p>If you didn’t request this, ignore this email.</p>";

                var msg = MailHelper.CreateSingleEmail(
                    from, to, subject, plainTextContent, htmlContent
                );

                await client.SendEmailAsync(msg);

                return new AuthResponse
                {
                    IsAuthenticated = true,
                    Message = genericMessage
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    IsAuthenticated = false,
                    Message = $"Failed: {ex.Message}"
                };
            }
        }
        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return new AuthResponse
                {
                    IsAuthenticated = false,
                    Message = "User not found"
                };
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                model.Token,      // NO decoding
                model.NewPassword
            );

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
                Message = "Password reset successful"
            };
        }
        private string GenerateJwtToken(IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
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

