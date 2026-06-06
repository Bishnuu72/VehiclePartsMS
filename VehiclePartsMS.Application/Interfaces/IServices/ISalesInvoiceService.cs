using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface ISalesInvoiceService
{
    Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync();
    Task<SalesInvoiceResponseDto?> GetByIdAsync(long id);
    Task<SalesInvoiceResponseDto> CreateAsync(SalesInvoiceCreateDto dto);
    Task<SalesInvoiceResponseDto> UpdatePaymentStatusAsync(long id, PaymentStatus newStatus);
    Task SendInvoiceEmailAsync(long invoiceId);
}
