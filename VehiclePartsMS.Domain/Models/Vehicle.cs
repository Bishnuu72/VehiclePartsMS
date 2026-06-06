using System.ComponentModel.DataAnnotations;

namespace VehiclePartsMS.Domain.Models;

public class Vehicle
{
    [Key]
    public long Id { get; set; }

    public long CustomerProfileId { get; set; }
    public virtual CustomerProfile CustomerProfile { get; set; } = null!;

    [Required, MaxLength(50)]
    public string VehicleNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Make { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    public int? Year { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public virtual ICollection<ServiceAppointment> Appointments { get; set; } = new List<ServiceAppointment>();
}
