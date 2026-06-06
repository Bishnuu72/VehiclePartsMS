using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface ISalesInvoiceRepository
{
    Task<IEnumerable<SalesInvoice>> GetInvoicesInDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<decimal> GetTotalRevenueAsync(DateTime startDate, DateTime endDate);
    Task<int> GetInvoiceCountAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync();
    Task<SalesInvoice?> FindByIdAsync(long id);
    Task<SalesInvoice> CreateAsync(SalesInvoice invoice);
    Task UpdateAsync(SalesInvoice invoice);
    Task<IEnumerable<SalesInvoice>> GetOverdueCreditInvoicesAsync();
}
