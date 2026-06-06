using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PartRequestsController(IPartRequestService service) : ControllerBase
{
    // GET: api/partrequests
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartRequestResponseDto>>> GetAll()
        => Ok(await service.GetAllAsync());

    // POST: api/partrequests
    [HttpPost]
    public async Task<ActionResult<PartRequestResponseDto>> Create(PartRequestCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), created);
    }

    // PUT: api/partrequests/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<PartRequestResponseDto>> Update(long id, PartRequestUpdateDto dto)
    {
        var updated = await service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    // PUT: api/partrequests/{id}/status  (staff/admin: mark Available/Unavailable)
    [HttpPut("{id}/status")]
    public async Task<ActionResult<PartRequestResponseDto>> UpdateStatus(
        long id, PartRequestStatusUpdateDto dto)
    {
        var updated = await service.UpdateStatusAsync(id, dto.Status);
        return Ok(updated);
    }

    // DELETE: api/partrequests/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
