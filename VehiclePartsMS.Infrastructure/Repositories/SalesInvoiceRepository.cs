using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class SalesInvoiceRepository(ApplicationDbContext context) : ISalesInvoiceRepository
{
    public async Task<IEnumerable<SalesInvoice>> GetInvoicesInDateRangeAsync(DateTime startDate, DateTime endDate)
        => await context.SalesInvoices
            .Where(i => i.SaleDate >= startDate && i.SaleDate <= endDate)
            .ToListAsync();

    public async Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate)
        => await context.SalesInvoices
            .Where(i => i.SaleDate >= startDate && i.SaleDate <= endDate)
            .SumAsync(i => i.TotalAmount);

    public async Task<int> GetInvoiceCountAsync(DateTime startDate, DateTime endDate)
        => await context.SalesInvoices
            .Where(i => i.SaleDate >= startDate && i.SaleDate <= endDate)
            .CountAsync();

    public async Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync()
        => await context.SalesInvoices
            .Include(i => i.CustomerProfile).ThenInclude(c => c.User)
            .Include(i => i.Staff)
            .Include(i => i.Items).ThenInclude(item => item.Part)
            .Select(i => new SalesInvoiceResponseDto(
                i.Id,
                i.CustomerProfileId,
                i.CustomerProfile.User.FirstName + " " + i.CustomerProfile.User.LastName,
                i.StaffId,
                i.Staff.FirstName + " " + i.Staff.LastName,
                i.SaleDate,
                i.SubTotal,
                i.DiscountPercent,
                i.TotalAmount,
                i.PaymentStatus.ToString(),
                i.Items.Select(item => new SalesInvoiceItemResponseDto(
                    item.Id,
                    item.PartId,
                    item.Part.Name,
                    item.Quantity,
                    item.UnitPrice,
                    item.Quantity * item.UnitPrice)).ToList()))
            .ToListAsync();

    public async Task<SalesInvoice?> FindByIdAsync(long id)
        => await context.SalesInvoices
            .Include(i => i.CustomerProfile).ThenInclude(c => c.User)
            .Include(i => i.Staff)
            .Include(i => i.Items).ThenInclude(item => item.Part)
            .FirstOrDefaultAsync(i => i.Id == id);

    public async Task<SalesInvoice> CreateAsync(SalesInvoice invoice)
    {
        context.SalesInvoices.Add(invoice);
        await context.SaveChangesAsync();
        return invoice;
    }

    public async Task UpdateAsync(SalesInvoice invoice)
    {
        context.SalesInvoices.Update(invoice);
        await context.SaveChangesAsync();
    }

    public async Task<IEnumerable<SalesInvoice>> GetOverdueCreditInvoicesAsync()
    {
        var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
        return await context.SalesInvoices
            .Include(i => i.CustomerProfile).ThenInclude(c => c.User)
            .Where(i => i.PaymentStatus == PaymentStatus.Credit && i.SaleDate <= oneMonthAgo)
            .ToListAsync();
    }
}
