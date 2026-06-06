using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IAppointmentRepository
{
    Task<IEnumerable<AppointmentResponseDto>> GetAllAsync();
    Task<ServiceAppointment?> FindByIdAsync(long id);
    Task<ServiceAppointment> CreateAsync(ServiceAppointment appointment);
    Task UpdateAsync(ServiceAppointment appointment);
    Task DeleteAsync(ServiceAppointment appointment);
}
