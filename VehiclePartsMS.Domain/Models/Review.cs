using System.ComponentModel.DataAnnotations;

namespace VehiclePartsMS.Domain.Models;

public class Review
{
    [Key]
    public long Id { get; set; }

    public long CustomerProfileId { get; set; }
    public virtual CustomerProfile CustomerProfile { get; set; } = null!;

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
}
