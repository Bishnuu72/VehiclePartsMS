using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsMS.Domain.Models;

public class PurchaseInvoice
{
    [Key]
    public long Id { get; set; }

    public long VendorId { get; set; }
    public virtual Vendor Vendor { get; set; } = null!;

    public long AdminId { get; set; }
    public virtual User Admin { get; set; } = null!;

    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public virtual ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
}
