namespace VehiclePartsMS.Application.DTOs;

public record VendorCreateDto(
    string Name,
    string? Phone,
    string? Email,
    string? Address);

public record VendorUpdateDto(
    string Name,
    string? Phone,
    string? Email,
    string? Address);

public record VendorResponseDto(
    long Id,
    string Name,
    string? Phone,
    string? Email,
    string? Address);

public record VendorSummaryDto(
    long Id,
    string Name);
