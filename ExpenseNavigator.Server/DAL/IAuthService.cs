using ExpenseNavigator.Server.Models;
using ExpenseNavigatorAPI.Models;

namespace ExpenseNavigator.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterModel model);
        Task<AuthResponse> LoginAsync(LoginModel model);
        Task<AuthResponse> ForgotPasswordAsync(string email);
        Task<AuthResponse> ResetPasswordAsync(ResetPasswordModel model);
    }
}
