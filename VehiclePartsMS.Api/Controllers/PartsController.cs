using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PartsController(IVehiclePartService service, IWebHostEnvironment env) : ControllerBase
{
    // GET: api/parts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehiclePartResponseDto>>> GetParts(
        [FromQuery] string? category,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        if (!string.IsNullOrWhiteSpace(category))
            return Ok(await service.GetByCategoryAsync(category, pageNumber, pageSize));
        return Ok(await service.GetAllAsync(pageNumber, pageSize));
    }

    // GET: api/parts/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<VehiclePartResponseDto>> GetPart(long id)
    {
        var part = await service.GetByIdAsync(id);
        return part is null ? NotFound() : Ok(part);
    }

    // POST: api/parts
    [HttpPost]
    public async Task<ActionResult<VehiclePartResponseDto>> PostPart(VehiclePartCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetPart), new { id = created.Id }, created);
    }

    // PUT: api/parts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPart(long id, VehiclePartUpdateDto dto)
    {
        try   { await service.UpdateAsync(id, dto); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }

    // DELETE: api/parts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePart(long id)
    {
        try   { await service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }

    // POST: api/parts/{id}/image
    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadPartImage(long id, IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest(new { message = "No image file provided." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(image.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPEG, PNG, and WebP images are allowed." });

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "images", "parts");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(image.FileName);
        var fileName = $"{id}_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        var imageUrl = $"/images/parts/{fileName}";
        try   { await service.SetImageUrlAsync(id, imageUrl); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }

        return Ok(new { imageUrl });
    }
}
