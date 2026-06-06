using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsMS.Domain.Models;

public class CustomerProfile
{
    [Key]
    public long Id { get; set; }

    public long UserId { get; set; }
    public virtual User User { get; set; } = null!;

    [MaxLength(500)]
    public string? Address { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalSpent { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CreditBalance { get; set; }

    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public virtual ICollection<SalesInvoice> SalesInvoices { get; set; } = new List<SalesInvoice>();
    public virtual ICollection<ServiceAppointment> Appointments { get; set; } = new List<ServiceAppointment>();
    public virtual ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
