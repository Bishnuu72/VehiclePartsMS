using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VendorsController(IVendorService service) : ControllerBase
{
    // GET: api/vendors
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VendorResponseDto>>> GetVendors()
        => Ok(await service.GetAllAsync());

    // GET: api/vendors/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<VendorResponseDto>> GetVendor(long id)
    {
        var vendor = await service.GetByIdAsync(id);
        return vendor is null ? NotFound() : Ok(vendor);
    }

    // POST: api/vendors
    [HttpPost]
    public async Task<ActionResult<VendorResponseDto>> PostVendor(VendorCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetVendor), new { id = created.Id }, created);
    }

    // PUT: api/vendors/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutVendor(long id, VendorUpdateDto dto)
    {
        try   { await service.UpdateAsync(id, dto); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }

    // DELETE: api/vendors/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVendor(long id)
    {
        try   { await service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }
}
