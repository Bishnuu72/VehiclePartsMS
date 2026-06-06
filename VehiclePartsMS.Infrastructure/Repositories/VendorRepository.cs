using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class VendorRepository(ApplicationDbContext context) : IVendorRepository
{
    public async Task<IEnumerable<VendorResponseDto>> GetAllAsync()
        => await context.Vendors
            .Select(v => new VendorResponseDto(v.Id, v.Name, v.Phone, v.Email, v.Address))
            .ToListAsync();

    public async Task<Vendor?> FindByIdAsync(long id)
        => await context.Vendors.FindAsync(id);

    public async Task<Vendor> AddAsync(Vendor vendor)
    {
        context.Vendors.Add(vendor);
        await context.SaveChangesAsync();
        return vendor;
    }

    public async Task UpdateAsync(Vendor vendor)
    {
        context.Vendors.Update(vendor);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Vendor vendor)
    {
        context.Vendors.Remove(vendor);
        await context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(long id)
        => await context.Vendors.AnyAsync(v => v.Id == id);
}
