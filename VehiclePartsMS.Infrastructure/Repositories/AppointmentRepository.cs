using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class AppointmentRepository(ApplicationDbContext context) : IAppointmentRepository
{
    public async Task<IEnumerable<AppointmentResponseDto>> GetAllAsync()
        => await context.ServiceAppointments
            .Include(a => a.CustomerProfile).ThenInclude(c => c.User)
            .Include(a => a.Vehicle)
            .Select(a => new AppointmentResponseDto(
                a.Id,
                a.CustomerProfileId,
                a.CustomerProfile.User.FirstName + " " + a.CustomerProfile.User.LastName,
                a.VehicleId,
                a.Vehicle != null ? a.Vehicle.VehicleNumber : null,
                a.AppointmentDate,
                a.Status.ToString(),
                a.Notes,
                a.CreatedAt))
            .ToListAsync();

    public async Task<ServiceAppointment?> FindByIdAsync(long id)
        => await context.ServiceAppointments.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<ServiceAppointment> CreateAsync(ServiceAppointment appointment)
    {
        context.ServiceAppointments.Add(appointment);
        await context.SaveChangesAsync();
        return appointment;
    }

    public async Task UpdateAsync(ServiceAppointment appointment)
    {
        context.ServiceAppointments.Update(appointment);
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ServiceAppointment appointment)
    {
        context.ServiceAppointments.Remove(appointment);
        await context.SaveChangesAsync();
    }
}
