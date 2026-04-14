using ExpenseNavigator.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace ExpenseNavigator.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IConfiguration _config;

        public ContactController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> SendEmail([FromBody] ContactRequest model)
        {
            try
            {
                // ✅ Basic validation
                if (model == null ||
                    string.IsNullOrEmpty(model.Name) ||
                    string.IsNullOrEmpty(model.Email) ||
                    string.IsNullOrEmpty(model.Message))
                {
                    return BadRequest("All fields are required.");
                }

                var email = _config["EmailSettings:Email"];
                var password = _config["EmailSettings:Password"];

                var client = new SmtpClient("smtp.gmail.com", 587)
                {
                    Credentials = new NetworkCredential(email, password),
                    EnableSsl = true
                };

                var mail = new MailMessage
                {
                    From = new MailAddress(email),
                    Subject = $"📩 New message from {model.Name}",
                    Body = $"Sender Name: {model.Name}\n" +
                           $"Sender Email: {model.Email}\n\n" +
                           $"Message:\n{model.Message}"
                };

                mail.To.Add(email);

                await client.SendMailAsync(mail);

                return Ok(new { success = true, message = "Email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to send email.",
                    error = ex.Message
                });
            }
        }
    }
}