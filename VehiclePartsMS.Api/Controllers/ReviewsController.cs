using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController(IReviewService service) : ControllerBase
{
    // GET: api/reviews
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewResponseDto>>> GetAll()
        => Ok(await service.GetAllAsync());

    // POST: api/reviews
    [HttpPost]
    public async Task<ActionResult<ReviewResponseDto>> Create(ReviewCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), created);
    }
}
