using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class PurchaseInvoiceService(
    IPurchaseInvoiceRepository invoiceRepo,
    IVehiclePartRepository partRepo,
    IVendorRepository vendorRepo) : IPurchaseInvoiceService
{
    public async Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync()
        => await invoiceRepo.GetAllAsync();

    public async Task<PurchaseInvoiceResponseDto?> GetByIdAsync(long id)
    {
        var invoice = await invoiceRepo.FindByIdAsync(id);
        if (invoice is null) return null;
        return MapToDto(invoice);
    }

    public async Task<PurchaseInvoiceResponseDto> CreateAsync(PurchaseInvoiceCreateDto dto)
    {
        _ = await vendorRepo.FindByIdAsync(dto.VendorId)
            ?? throw new KeyNotFoundException($"Vendor {dto.VendorId} not found.");

        decimal total = 0;
        var lineItems = new List<(VehiclePart Part, int Quantity, decimal UnitCost)>();

        foreach (var item in dto.Items)
        {
            var part = await partRepo.FindByIdAsync(item.PartId)
                ?? throw new KeyNotFoundException($"Part {item.PartId} not found.");

            lineItems.Add((part, item.Quantity, item.UnitCost));
            total += item.UnitCost * item.Quantity;
        }

        // Increase stock for each part
        foreach (var (part, qty, _) in lineItems)
        {
            part.StockQuantity += qty;
            await partRepo.UpdateAsync(part);
        }

        var invoice = new PurchaseInvoice
        {
            VendorId    = dto.VendorId,
            AdminId     = dto.AdminId,
            TotalAmount = total,
            Items = lineItems.Select(x => new PurchaseInvoiceItem
            {
                PartId   = x.Part.Id,
                Quantity = x.Quantity,
                UnitCost = x.UnitCost
            }).ToList()
        };

        var created = await invoiceRepo.CreateAsync(invoice);

        var full = await invoiceRepo.FindByIdAsync(created.Id)
            ?? throw new Exception("Failed to load created purchase invoice.");

        return MapToDto(full);
    }

    private static PurchaseInvoiceResponseDto MapToDto(PurchaseInvoice p)
        => new(
            p.Id,
            p.VendorId,
            p.Vendor.Name,
            p.AdminId,
            $"{p.Admin.FirstName} {p.Admin.LastName}",
            p.PurchaseDate,
            p.TotalAmount,
            p.Items.Select(i => new PurchaseInvoiceItemResponseDto(
                i.Id,
                i.PartId,
                i.Part.Name,
                i.Quantity,
                i.UnitCost,
                i.Quantity * i.UnitCost)).ToList());
}
