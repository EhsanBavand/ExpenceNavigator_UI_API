using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace ExpenseNavigatorAPI.Models
{
    using Microsoft.AspNetCore.Identity;

    public class Place
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; }
        public string UserId { get; set; }
        [JsonIgnore] public IdentityUser User { get; set; }
        public bool IsActive { get; set; }
        public bool IsRecurring { get; set; }
    }
    public class PlaceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public bool IsActive { get; set; }
        public bool IsRecurring { get; set; }
    }
    public class PlaceDropdownDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}
