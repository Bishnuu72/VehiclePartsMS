using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(IUserService service, IWebHostEnvironment env) : ControllerBase
{
    private long? CurrentUserId()
        => long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        return Ok(await service.LoginAsync(dto));
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(RegisterDto dto)
    {
        return Ok(await service.RegisterAsync(dto));
    }

    [HttpGet("staff")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllStaff()
    {
        return Ok(await service.GetAllStaffAsync());
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        return Ok(await service.GetProfileAsync(userId.Value));
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateMyProfile(UserProfileUpdateDto dto)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        return Ok(await service.UpdateProfileAsync(userId.Value, dto));
    }

    [HttpPost("me/profile-picture")]
    [Authorize]
    public async Task<IActionResult> UploadProfilePicture(IFormFile image)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        if (image is null || image.Length == 0)
            return BadRequest(new { message = "No image file provided." });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(image.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPEG, PNG, and WebP images are allowed." });

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "images", "profiles");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(image.FileName);
        var fileName = $"{userId.Value}_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(dir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        var imageUrl = $"/images/profiles/{fileName}";
        await service.SetProfilePictureAsync(userId.Value, imageUrl);

        return Ok(new { imageUrl });
    }

    [HttpPost("me/password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        await service.ChangePasswordAsync(userId.Value, dto);
        return Ok(new { message = "Password changed successfully." });
    }

    // Admin: view a specific user's (e.g. staff member's) profile detail
    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetById(long id)
        => Ok(await service.GetProfileAsync(id));

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        await service.DeleteUserAsync(id);
        return NoContent();
    }
}
