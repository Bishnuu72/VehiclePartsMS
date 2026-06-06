using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Services;

public class UserService(
    UserManager<User> userManager,
    RoleManager<IdentityRole<long>> roleManager,
    IConfiguration config,
    ApplicationDbContext context) : IUserService
{
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email) 
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!await userManager.CheckPasswordAsync(user, dto.Password))
            throw new UnauthorizedAccessException("Invalid credentials.");

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Customer";

        return GenerateJwt(user, role);
    }

    public async Task<UserResponseDto> RegisterAsync(RegisterDto dto)
    {
        var user = new User { 
            UserName = dto.Email, 
            Email = dto.Email, 
            FirstName = dto.FirstName, 
            LastName = dto.LastName 
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, dto.Role);

        if (dto.Role == "Customer")
        {
            context.CustomerProfiles.Add(new CustomerProfile { UserId = user.Id });
            await context.SaveChangesAsync();
        }

        return new UserResponseDto(user.Id, $"{user.FirstName} {user.LastName}", user.Email!, dto.Role, user.IsActive);
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllStaffAsync()
    {
        var staffUsers = await userManager.GetUsersInRoleAsync("Staff");
        return staffUsers.Select(u => new UserResponseDto(u.Id, $"{u.FirstName} {u.LastName}", u.Email!, "Staff", u.IsActive));
    }

    public async Task<UserProfileDto> GetProfileAsync(long userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");
        return await MapProfileAsync(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(long userId, UserProfileUpdateDto dto)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        user.FirstName   = dto.FirstName;
        user.LastName    = dto.LastName;
        user.PhoneNumber = dto.Phone;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        return await MapProfileAsync(user);
    }

    public async Task SetProfilePictureAsync(long userId, string imageUrl)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        user.ProfilePictureUrl = imageUrl;
        await userManager.UpdateAsync(user);
    }

    public async Task ChangePasswordAsync(long userId, ChangePasswordDto dto)
    {
        var user = await userManager.FindByIdAsync(userId.ToString())
            ?? throw new KeyNotFoundException("User not found.");

        var result = await userManager.ChangePasswordAsync(
            user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
    }

    public async Task DeleteUserAsync(long id)
    {
        var user = await userManager.FindByIdAsync(id.ToString())
            ?? throw new KeyNotFoundException("User not found.");
        await userManager.DeleteAsync(user);
    }

    private async Task<UserProfileDto> MapProfileAsync(User user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Customer";
        return new UserProfileDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email!,
            user.PhoneNumber,
            role,
            user.IsActive,
            user.CreatedAt,
            user.ProfilePictureUrl);
    }

    private AuthResponseDto GenerateJwt(User user, string role)
    {
        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new AuthResponseDto(new JwtSecurityTokenHandler().WriteToken(token), user.Email!, role, expiry);
    }
}
