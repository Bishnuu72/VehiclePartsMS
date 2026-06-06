using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface ICustomerRepository
{
    Task<IEnumerable<CustomerResponseDto>> GetAllAsync();
    Task<IEnumerable<CustomerResponseDto>> SearchAsync(string? name, string? phone, string? vehicleNumber, long? id);
    Task<IEnumerable<CustomerReportItemDto>> GetTopSpendersAsync(int top);
    Task<IEnumerable<CustomerReportItemDto>> GetRegularCustomersAsync(int top);
    Task<IEnumerable<CustomerReportItemDto>> GetPendingCreditsAsync();
    Task<CustomerProfile?> FindByIdAsync(long id);
    Task<CustomerProfile?> FindByIdWithHistoryAsync(long id);
    Task<CustomerProfile> AddAsync(CustomerProfile customer);
    Task UpdateAsync(CustomerProfile customer);
    Task<CustomerResponseDto?> GetByUserIdAsync(long userId);
    Task<bool> ExistsByUserIdAsync(long userId);
    Task<Vehicle?> FindVehicleAsync(long customerId, long vehicleId);
    Task<VehicleResponseDto> AddVehicleAsync(long customerId, Vehicle vehicle);
    Task UpdateVehicleAsync(Vehicle vehicle);
    Task DeleteVehicleAsync(Vehicle vehicle);
}
