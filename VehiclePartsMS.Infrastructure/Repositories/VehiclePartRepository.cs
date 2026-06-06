using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class VehiclePartRepository(ApplicationDbContext context) : IVehiclePartRepository
{
    public async Task<IEnumerable<VehiclePartResponseDto>> GetAllAsync(int pageNumber, int pageSize)
        => await context.VehicleParts
            .Include(p => p.Vendor)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new VehiclePartResponseDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.StockQuantity, p.VendorId, p.Vendor.Name, p.ImageUrl))
            .ToListAsync();

    public async Task<IEnumerable<VehiclePartResponseDto>> GetByCategoryAsync(string category, int pageNumber, int pageSize)
        => await context.VehicleParts
            .Include(p => p.Vendor)
            .Where(p => p.Category == category)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new VehiclePartResponseDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.StockQuantity, p.VendorId, p.Vendor.Name, p.ImageUrl))
            .ToListAsync();

    public async Task<VehiclePartResponseDto?> GetByIdAsync(long id)
        => await context.VehicleParts
            .Include(p => p.Vendor)
            .Where(p => p.Id == id)
            .Select(p => new VehiclePartResponseDto(p.Id, p.Name, p.Description, p.Category, p.Price, p.StockQuantity, p.VendorId, p.Vendor.Name, p.ImageUrl))
            .FirstOrDefaultAsync();

    public async Task<VehiclePart?> FindByIdAsync(long id)
        => await context.VehicleParts.FindAsync(id);

    public async Task<VehiclePart> AddAsync(VehiclePart part)
    {
        context.VehicleParts.Add(part);
        await context.SaveChangesAsync();
        return part;
    }

    public async Task UpdateAsync(VehiclePart part)
    {
        context.VehicleParts.Update(part);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(VehiclePart part)
    {
        context.VehicleParts.Remove(part);
        await context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(long id)
        => await context.VehicleParts.AnyAsync(p => p.Id == id);

    public async Task<IEnumerable<VehiclePart>> GetLowStockAsync(int threshold = 10)
        => await context.VehicleParts
            .Where(p => p.StockQuantity < threshold)
            .ToListAsync();
}
