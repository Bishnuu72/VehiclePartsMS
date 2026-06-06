using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class PartRequestRepository(ApplicationDbContext context) : IPartRequestRepository
{
    public async Task<IEnumerable<PartRequestResponseDto>> GetAllAsync()
        => await context.PartRequests
            .Include(r => r.CustomerProfile).ThenInclude(c => c.User)
            .Select(r => new PartRequestResponseDto(
                r.Id,
                r.CustomerProfileId,
                r.CustomerProfile.User.FirstName + " " + r.CustomerProfile.User.LastName,
                r.PartName,
                r.Description,
                r.RequestDate,
                r.Status.ToString()))
            .ToListAsync();

    public async Task<PartRequest?> FindByIdAsync(long id)
        => await context.PartRequests.FirstOrDefaultAsync(r => r.Id == id);

    public async Task<PartRequest> CreateAsync(PartRequest request)
    {
        context.PartRequests.Add(request);
        await context.SaveChangesAsync();
        return request;
    }

    public async Task UpdateAsync(PartRequest request)
    {
        context.PartRequests.Update(request);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(PartRequest request)
    {
        context.PartRequests.Remove(request);
        await context.SaveChangesAsync();
    }
}
