using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomersController(ICustomerService service, IWebHostEnvironment env) : ControllerBase
{
    // GET: api/customers/me
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CustomerResponseDto>> GetMyProfile()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdStr is null || !long.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var customer = await service.EnsureProfileAsync(userId);
        return Ok(customer);
    }

    // GET: api/customers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetCustomers()
        => Ok(await service.GetAllAsync());

    // GET: api/customers/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerResponseDto>> GetCustomer(long id)
    {
        var customer = await service.GetByIdAsync(id);
        return customer is null ? NotFound() : Ok(customer);
    }

    // GET: api/customers/search?name=&phone=&vehicleNumber=&id=
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> Search(
        [FromQuery] string? name,
        [FromQuery] string? phone,
        [FromQuery] string? vehicleNumber,
        [FromQuery] long? id)
        => Ok(await service.SearchAsync(name, phone, vehicleNumber, id));

    // GET: api/customers/{id}/details
    [HttpGet("{id}/details")]
    public async Task<ActionResult<CustomerDetailDto>> GetCustomerDetails(long id)
    {
        var detail = await service.GetDetailsAsync(id);
        return detail is null ? NotFound() : Ok(detail);
    }

    // GET: api/customers/reports/top-spenders?top=10
    [HttpGet("reports/top-spenders")]
    public async Task<ActionResult<IEnumerable<CustomerReportItemDto>>> GetTopSpenders([FromQuery] int top = 10)
        => Ok(await service.GetTopSpendersAsync(top));

    // GET: api/customers/reports/regulars?top=10
    [HttpGet("reports/regulars")]
    public async Task<ActionResult<IEnumerable<CustomerReportItemDto>>> GetRegulars([FromQuery] int top = 10)
        => Ok(await service.GetRegularCustomersAsync(top));

    // GET: api/customers/reports/pending-credits
    [HttpGet("reports/pending-credits")]
    public async Task<ActionResult<IEnumerable<CustomerReportItemDto>>> GetPendingCredits()
        => Ok(await service.GetPendingCreditsAsync());

    // POST: api/customers/register
    [HttpPost("register")]
    public async Task<ActionResult<CustomerResponseDto>> Register(CustomerRegisterDto dto)
    {
        var created = await service.RegisterAsync(dto);
        return CreatedAtAction(nameof(GetCustomer), new { id = created.Id }, created);
    }

    // PUT: api/customers/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(long id, CustomerUpdateDto dto)
    {
        await service.UpdateProfileAsync(id, dto);
        return NoContent();
    }

    // POST: api/customers/{id}/vehicles
    [HttpPost("{id}/vehicles")]
    public async Task<ActionResult<VehicleResponseDto>> AddVehicle(long id, VehicleCreateDto dto)
    {
        var vehicle = await service.AddVehicleAsync(id, dto);
        return CreatedAtAction(nameof(GetCustomer), new { id }, vehicle);
    }

    // PUT: api/customers/{id}/vehicles/{vehicleId}
    [HttpPut("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> UpdateVehicle(long id, long vehicleId, VehicleUpdateDto dto)
    {
        await service.UpdateVehicleAsync(id, vehicleId, dto);
        return NoContent();
    }

    // DELETE: api/customers/{id}/vehicles/{vehicleId}
    [HttpDelete("{id}/vehicles/{vehicleId}")]
    public async Task<IActionResult> DeleteVehicle(long id, long vehicleId)
    {
        await service.DeleteVehicleAsync(id, vehicleId);
        return NoContent();
    }

    // POST: api/customers/{id}/vehicles/{vehicleId}/image
    [HttpPost("{id}/vehicles/{vehicleId}/image")]
    public async Task<IActionResult> UploadVehicleImage(long id, long vehicleId, IFormFile image)
    {
        if (image is null || image.Length == 0)
            return BadRequest(new { message = "No image file provided." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(image.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPEG, PNG, and WebP images are allowed." });

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "images", "vehicles");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(image.FileName);
        var fileName = $"{vehicleId}_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        var imageUrl = $"/images/vehicles/{fileName}";
        try   { await service.SetVehicleImageUrlAsync(id, vehicleId, imageUrl); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }

        return Ok(new { imageUrl });
    }
}
