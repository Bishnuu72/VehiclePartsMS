using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface ICustomerService
{
    Task<IEnumerable<CustomerResponseDto>> GetAllAsync();
    Task<IEnumerable<CustomerResponseDto>> SearchAsync(string? name, string? phone, string? vehicleNumber, long? id);
    Task<IEnumerable<CustomerReportItemDto>> GetTopSpendersAsync(int top);
    Task<IEnumerable<CustomerReportItemDto>> GetRegularCustomersAsync(int top);
    Task<IEnumerable<CustomerReportItemDto>> GetPendingCreditsAsync();
    Task<CustomerResponseDto?> GetByIdAsync(long id);
    Task<CustomerResponseDto?> GetByUserIdAsync(long userId);
    Task<CustomerResponseDto> EnsureProfileAsync(long userId);
    Task<CustomerDetailDto?> GetDetailsAsync(long id);
    Task<CustomerResponseDto> RegisterAsync(CustomerRegisterDto dto);
    Task UpdateProfileAsync(long id, CustomerUpdateDto dto);
    Task<VehicleResponseDto> AddVehicleAsync(long customerId, VehicleCreateDto dto);
    Task UpdateVehicleAsync(long customerId, long vehicleId, VehicleUpdateDto dto);
    Task SetVehicleImageUrlAsync(long customerId, long vehicleId, string imageUrl);
    Task DeleteVehicleAsync(long customerId, long vehicleId);
}
