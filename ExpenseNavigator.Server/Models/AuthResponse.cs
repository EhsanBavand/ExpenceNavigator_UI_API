namespace ExpenseNavigatorAPI.Models
{
    public class AuthResponse
    {
        public bool IsAuthenticated { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }

        public string UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
    }

}
