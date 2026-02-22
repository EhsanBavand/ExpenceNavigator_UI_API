namespace ExpenseNavigatorAPI.Helper
{
    public static class HelperExtention
    {
        public static IEnumerable<(int Year, int Month)> GetMonthsInRange(int fromMonth, int toMonth)
        {
            int year = DateTime.Now.Year; // assume same year
            var start = new DateTime(year, fromMonth, 1);
            var end = new DateTime(year, toMonth, 1);

            if (end < start)
            {
                (start, end) = (end, start);
            }

            var cursor = start;
            while (cursor <= end)
            {
                yield return (cursor.Year, cursor.Month);
                cursor = cursor.AddMonths(1);
            }
        }

        public static readonly string[] MonthNames = new[]
        {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        };
    }
}
