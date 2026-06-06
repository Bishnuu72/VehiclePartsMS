using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class VendorService(IVendorRepository repo) : IVendorService
{
    public Task<IEnumerable<VendorResponseDto>> GetAllAsync() => repo.GetAllAsync();

    public async Task<VendorResponseDto?> GetByIdAsync(long id)
    {
        var vendor = await repo.FindByIdAsync(id);
        return vendor is null ? null
            : new VendorResponseDto(vendor.Id, vendor.Name, vendor.Phone, vendor.Email, vendor.Address);
    }

    public async Task<VendorResponseDto> CreateAsync(VendorCreateDto dto)
    {
        var vendor = new Vendor
        {
            Name    = dto.Name,
            Phone   = dto.Phone,
            Email   = dto.Email,
            Address = dto.Address
        };
        var created = await repo.AddAsync(vendor);
        return new VendorResponseDto(created.Id, created.Name, created.Phone, created.Email, created.Address);
    }

    public async Task UpdateAsync(long id, VendorUpdateDto dto)
    {
        var existing = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Vendor {id} not found.");

        existing.Name    = dto.Name;
        existing.Phone   = dto.Phone;
        existing.Email   = dto.Email;
        existing.Address = dto.Address;

        await repo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(long id)
    {
        var existing = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Vendor {id} not found.");
        await repo.DeleteAsync(existing);
    }
}
