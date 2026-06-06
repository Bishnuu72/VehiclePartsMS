using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentResponseDto>> GetAllAsync();
    Task<AppointmentResponseDto> CreateAsync(AppointmentCreateDto dto);
    Task<AppointmentResponseDto> UpdateAsync(long id, AppointmentUpdateDto dto);
    Task DeleteAsync(long id);
}
