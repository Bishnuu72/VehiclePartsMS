using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class PurchaseInvoiceRepository(ApplicationDbContext context) : IPurchaseInvoiceRepository
{
    public async Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync()
        => await context.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Admin)
            .Include(p => p.Items).ThenInclude(i => i.Part)
            .Select(p => new PurchaseInvoiceResponseDto(
                p.Id,
                p.VendorId,
                p.Vendor.Name,
                p.AdminId,
                p.Admin.FirstName + " " + p.Admin.LastName,
                p.PurchaseDate,
                p.TotalAmount,
                p.Items.Select(i => new PurchaseInvoiceItemResponseDto(
                    i.Id,
                    i.PartId,
                    i.Part.Name,
                    i.Quantity,
                    i.UnitCost,
                    i.Quantity * i.UnitCost)).ToList()))
            .ToListAsync();

    public async Task<PurchaseInvoice?> FindByIdAsync(long id)
        => await context.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Admin)
            .Include(p => p.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PurchaseInvoice> CreateAsync(PurchaseInvoice invoice)
    {
        context.PurchaseInvoices.Add(invoice);
        await context.SaveChangesAsync();
        return invoice;
    }
}
