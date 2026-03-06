using System.Threading.Tasks;

namespace ExpenseNavigator.Interfaces
{
    public interface ITestEmailService
    {
        Task<string> SendTestEmailAsync(string toEmail);
    }
}