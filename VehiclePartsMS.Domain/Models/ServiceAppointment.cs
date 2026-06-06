using System.ComponentModel.DataAnnotations;

namespace VehiclePartsMS.Domain.Models;

public class ServiceAppointment
{
    [Key]
    public long Id { get; set; }

    public long CustomerProfileId { get; set; }
    public virtual CustomerProfile CustomerProfile { get; set; } = null!;

    public long? VehicleId { get; set; }
    public virtual Vehicle? Vehicle { get; set; }

    public DateTime AppointmentDate { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
