namespace ExpenseNavigatorAPI.Models
{
    public class Saving
    {
        public Guid Id { get; set; }
        public string Source { get; set; } = string.Empty;

        public decimal Balance { get; set; }  
        public decimal? Target { get; set; }   

        public SavingType Type { get; set; }
        public DateTime CreatedDate { get; set; }
        public int Year { get; set; }
        public string UserId { get; set; }
    }

    public enum SavingType
    {
        Saving,
        Goal,
        Debt,
        Other
    }
    public class SavingDto
    {
        public Guid Id { get; set; }
        public string Source { get; set; } = string.Empty;

        public decimal Balance { get; set; }    
        public decimal? Target { get; set; }

        public SavingType Type { get; set; }
        public DateTime CreatedDate { get; set; }
        public int Year { get; set; }
        public string UserId { get; set; }
    }

    public class UpdateSavingRequest
    {
        public string Source { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public decimal? Target { get; set; }
        public SavingType Type { get; set; }
        public int Year { get; set; }
        public string UserId { get; set; }

    }

}
