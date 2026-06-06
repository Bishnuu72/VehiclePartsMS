using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsMS.Domain.Models;

public class SalesInvoice
{
    [Key]
    public long Id { get; set; }

    public long CustomerProfileId { get; set; }
    public virtual CustomerProfile CustomerProfile { get; set; } = null!;

    public long StaffId { get; set; }
    public virtual User Staff { get; set; } = null!;

    public DateTime SaleDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountPercent { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;

    public virtual ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
}
