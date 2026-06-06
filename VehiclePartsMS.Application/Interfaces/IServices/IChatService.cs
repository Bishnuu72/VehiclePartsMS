using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IChatService
{
    /// <summary>
    /// Sends a user message (with prior history) to the AI assistant.
    /// <paramref name="role"/> is the caller's role (Admin/Staff/Customer) and
    /// controls how much business context the assistant is given.
    /// </summary>
    Task<ChatResponseDto> AskAsync(
        string message, IEnumerable<ChatMessageDto> history, string role, long? userId);
}
