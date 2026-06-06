using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IVendorService
{
    Task<IEnumerable<VendorResponseDto>> GetAllAsync();
    Task<VendorResponseDto?> GetByIdAsync(long id);
    Task<VendorResponseDto> CreateAsync(VendorCreateDto dto);
    Task UpdateAsync(long id, VendorUpdateDto dto);
    Task DeleteAsync(long id);
}
