using Microsoft.AspNetCore.Identity;

namespace VehiclePartsMS.Domain.Models;

public class User : IdentityUser<long>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ProfilePictureUrl { get; set; }

    public virtual CustomerProfile? CustomerProfile { get; set; }
    public virtual ICollection<SalesInvoice> SalesInvoicesAsStaff { get; set; } = new List<SalesInvoice>();
}
