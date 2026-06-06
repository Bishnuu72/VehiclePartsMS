using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChatController(IChatService service) : ControllerBase
{
    // POST: api/chat
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ChatResponseDto>> Ask(ChatRequestDto dto)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Customer";
        long? userId = long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid)
            ? uid : null;
        var reply = await service.AskAsync(dto.Message, dto.History ?? [], role, userId);
        return Ok(reply);
    }
}
