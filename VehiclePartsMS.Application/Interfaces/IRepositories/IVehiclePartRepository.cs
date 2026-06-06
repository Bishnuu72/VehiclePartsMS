using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IVehiclePartRepository
{
    Task<IEnumerable<VehiclePartResponseDto>> GetAllAsync(int pageNumber, int pageSize);
    Task<IEnumerable<VehiclePartResponseDto>> GetByCategoryAsync(string category, int pageNumber, int pageSize);
    Task<VehiclePartResponseDto?> GetByIdAsync(long id);
    Task<VehiclePart?> FindByIdAsync(long id);
    Task<VehiclePart> AddAsync(VehiclePart part);
    Task UpdateAsync(VehiclePart part);
    Task DeleteAsync(VehiclePart part);
    Task<bool> ExistsAsync(long id);
    Task<IEnumerable<VehiclePart>> GetLowStockAsync(int threshold = 10);
}
