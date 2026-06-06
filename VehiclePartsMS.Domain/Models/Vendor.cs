using System.ComponentModel.DataAnnotations;

namespace VehiclePartsMS.Domain.Models;

public class Vendor
{
    [Key]
    public long Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public virtual ICollection<VehiclePart> Parts { get; set; } = new List<VehiclePart>();
}
