using ExpenseNavigator.Interfaces;
using ExpenseNavigatorAPI.Models;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace ExpenseNavigator.Services
{
    public class TestEmailService : ITestEmailService
    {
        private readonly IConfiguration _configuration;

        public TestEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<string> SendTestEmailAsync(string toEmail)
        {
            try
            {
                var apiKey = _configuration["SendGrid:ApiKey"];
                var client = new SendGridClient(apiKey);

                var from = new EmailAddress(_configuration["SendGrid:FromEmail"], "Expense Navigator");
                var subject = "Reset Your Expense Navigator Password";
                var plainTextContent = "This is a test email.";
                var htmlContent = "<strong>This is a test email.</strong>";
                var to = new EmailAddress(toEmail);

                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                var response = await client.SendEmailAsync(msg);

                if (response.IsSuccessStatusCode)
                    return $"Email sent successfully to {toEmail}. StatusCode: {response.StatusCode}";
                else
                {
                    var body = await response.Body.ReadAsStringAsync();
                    return $"Failed to send email. StatusCode: {response.StatusCode}, Body: {body}";
                }
            }
            catch (System.Exception ex)
            {
                return $"Exception: {ex.Message}";
            }
        }
    }
}