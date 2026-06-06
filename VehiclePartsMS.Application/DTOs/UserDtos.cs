namespace VehiclePartsMS.Application.DTOs;

public record LoginDto(string Email, string Password);

public record RegisterDto(
    string FirstName, 
    string LastName, 
    string Email, 
    string Password, 
    string Role = "Staff"
);

public record AuthResponseDto(
    string Token, 
    string Email, 
    string Role, 
    DateTime Expiry
);

public record UserResponseDto(
    long Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive
);

public record UserProfileDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    string? ProfilePictureUrl
);

public record UserProfileUpdateDto(
    string FirstName,
    string LastName,
    string? Phone
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);
