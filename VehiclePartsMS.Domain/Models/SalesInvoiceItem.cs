using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsMS.Domain.Models;

public class SalesInvoiceItem
{
    [Key]
    public long Id { get; set; }

    public long SalesInvoiceId { get; set; }
    public virtual SalesInvoice SalesInvoice { get; set; } = null!;

    public long PartId { get; set; }
    public virtual VehiclePart Part { get; set; } = null!;

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }
}
