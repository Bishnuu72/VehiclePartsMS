using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IVehiclePartService
{
    Task<IEnumerable<VehiclePartResponseDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
    Task<IEnumerable<VehiclePartResponseDto>> GetByCategoryAsync(string category, int pageNumber = 1, int pageSize = 10);
    Task<VehiclePartResponseDto?> GetByIdAsync(long id);
    Task<VehiclePartResponseDto> CreateAsync(VehiclePartCreateDto dto);
    Task UpdateAsync(long id, VehiclePartUpdateDto dto);
    Task DeleteAsync(long id);
    Task SetImageUrlAsync(long id, string imageUrl);
}
