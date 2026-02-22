namespace ExpenseNavigatorAPI.Models
{
    public class CopyItemsByRangeDateDto
    {
        public string UserId { get; set; } = null!;
        public int SourceMonth { get; set; }
        public int SourceYear { get; set; }
        public int TargetFromMonth { get; set; }
        public int TargetToMonth { get; set; }
    }

}
