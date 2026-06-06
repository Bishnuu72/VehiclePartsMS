namespace VehiclePartsMS.Application.DTOs;

// Role is "user" (from the person) or "assistant" (from the AI)
public record ChatMessageDto(string Role, string Content);

public record ChatRequestDto(
    string Message,
    List<ChatMessageDto>? History);

public record ChatResponseDto(string Reply);
