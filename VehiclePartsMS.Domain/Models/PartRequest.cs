using System.ComponentModel.DataAnnotations;

namespace VehiclePartsMS.Domain.Models;

public class PartRequest
{
    [Key]
    public long Id { get; set; }

    public long CustomerProfileId { get; set; }
    public virtual CustomerProfile CustomerProfile { get; set; } = null!;

    [Required, MaxLength(200)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime RequestDate { get; set; } = DateTime.UtcNow;

    public PartRequestStatus Status { get; set; } = PartRequestStatus.Pending;
}
