using Microsoft.Extensions.Options;
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ExpenseNavigatorAPI.Models
{
    namespace ExpenseNavigatorAPI.Models
    {
        public class Income
        {
            [Key]
            public Guid Id { get; set; } = Guid.NewGuid();
            public string UserId { get; set; }
            public string Owner { get; set; }
            public string SourceType { get; set; }
            public decimal Amount { get; set; }
            public DateTime Date { get; set; }
            public int Month { get; set; }
            public int Year { get; set; }
            public bool IsRecurring { get; set; }
            public bool IsEstimated { get; set; }
            [JsonConverter(typeof(JsonStringEnumConverter))]
            public RecurrenceFrequency Frequency { get; set; } // enum as string
            public string Description { get; set; }
            public string CreatedBy { get; set; }
            public DateTime CreatedDate { get; set; }
            public DateTime ModifiedDate { get; set; }
            public Guid IncomeSourceId { get; set; } 
        }

        public enum RecurrenceFrequency
        {
            None,       // One-time
            Weekly,
            ByWeekly,
            Monthly,
            Yearly
        }

    }
}
