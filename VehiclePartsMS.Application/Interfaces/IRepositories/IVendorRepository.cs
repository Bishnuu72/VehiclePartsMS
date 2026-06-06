using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IVendorRepository
{
    Task<IEnumerable<VendorResponseDto>> GetAllAsync();
    Task<Vendor?> FindByIdAsync(long id);
    Task<Vendor> AddAsync(Vendor vendor);
    Task UpdateAsync(Vendor vendor);
    Task DeleteAsync(Vendor vendor);
    Task<bool> ExistsAsync(long id);
}
