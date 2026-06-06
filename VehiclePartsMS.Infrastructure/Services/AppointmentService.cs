using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class AppointmentService(
    IAppointmentRepository repo,
    ICustomerRepository customerRepo) : IAppointmentService
{
    public async Task<IEnumerable<AppointmentResponseDto>> GetAllAsync()
        => await repo.GetAllAsync();

    public async Task<AppointmentResponseDto> CreateAsync(AppointmentCreateDto dto)
    {
        _ = await customerRepo.FindByIdAsync(dto.CustomerProfileId)
            ?? throw new KeyNotFoundException($"Customer profile {dto.CustomerProfileId} not found.");

        var appointment = new ServiceAppointment
        {
            CustomerProfileId = dto.CustomerProfileId,
            VehicleId         = dto.VehicleId,
            AppointmentDate   = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc),
            Notes             = dto.Notes
        };

        var created = await repo.CreateAsync(appointment);

        var all = await repo.GetAllAsync();
        return all.First(a => a.Id == created.Id);
    }

    public async Task<AppointmentResponseDto> UpdateAsync(long id, AppointmentUpdateDto dto)
    {
        var appointment = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Appointment {id} not found.");

        appointment.VehicleId       = dto.VehicleId;
        appointment.AppointmentDate = DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc);
        appointment.Notes           = dto.Notes;
        appointment.Status          = dto.Status;

        await repo.UpdateAsync(appointment);

        var all = await repo.GetAllAsync();
        return all.First(a => a.Id == id);
    }

    public async Task DeleteAsync(long id)
    {
        var appointment = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Appointment {id} not found.");

        await repo.DeleteAsync(appointment);
    }
}
