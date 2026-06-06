using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IPurchaseInvoiceRepository
{
    Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync();
    Task<PurchaseInvoice?> FindByIdAsync(long id);
    Task<PurchaseInvoice> CreateAsync(PurchaseInvoice invoice);
}
