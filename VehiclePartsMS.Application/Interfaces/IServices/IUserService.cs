using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IUserService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<UserResponseDto> RegisterAsync(RegisterDto dto);
    Task<IEnumerable<UserResponseDto>> GetAllStaffAsync();
    Task<UserProfileDto> GetProfileAsync(long userId);
    Task<UserProfileDto> UpdateProfileAsync(long userId, UserProfileUpdateDto dto);
    Task SetProfilePictureAsync(long userId, string imageUrl);
    Task ChangePasswordAsync(long userId, ChangePasswordDto dto);
    Task DeleteUserAsync(long id);
}
