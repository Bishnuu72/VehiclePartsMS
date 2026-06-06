using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IPurchaseInvoiceService
{
    Task<IEnumerable<PurchaseInvoiceResponseDto>> GetAllAsync();
    Task<PurchaseInvoiceResponseDto?> GetByIdAsync(long id);
    Task<PurchaseInvoiceResponseDto> CreateAsync(PurchaseInvoiceCreateDto dto);
}
