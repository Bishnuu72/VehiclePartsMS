using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IPartRequestService
{
    Task<IEnumerable<PartRequestResponseDto>> GetAllAsync();
    Task<PartRequestResponseDto> CreateAsync(PartRequestCreateDto dto);
    Task<PartRequestResponseDto> UpdateAsync(long id, PartRequestUpdateDto dto);
    Task<PartRequestResponseDto> UpdateStatusAsync(long id, PartRequestStatus status);
    Task DeleteAsync(long id);
}
