using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IPartRequestRepository
{
    Task<IEnumerable<PartRequestResponseDto>> GetAllAsync();
    Task<PartRequest?> FindByIdAsync(long id);
    Task<PartRequest> CreateAsync(PartRequest request);
    Task UpdateAsync(PartRequest request);
    Task DeleteAsync(PartRequest request);
}
