using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AppointmentsController(IAppointmentService service) : ControllerBase
{
    // GET: api/appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDto>>> GetAll()
        => Ok(await service.GetAllAsync());

    // POST: api/appointments
    [HttpPost]
    public async Task<ActionResult<AppointmentResponseDto>> Create(AppointmentCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), created);
    }

    // PUT: api/appointments/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<AppointmentResponseDto>> Update(long id, AppointmentUpdateDto dto)
    {
        var updated = await service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    // DELETE: api/appointments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
