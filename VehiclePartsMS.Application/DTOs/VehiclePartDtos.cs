namespace VehiclePartsMS.Application.DTOs;

public record VehiclePartCreateDto(
    string Name,
    string? Description,
    string? Category,
    decimal Price,
    int StockQuantity,
    long VendorId,
    string? ImageUrl);

public record VehiclePartUpdateDto(
    string Name,
    string? Description,
    string? Category,
    decimal Price,
    int StockQuantity,
    long VendorId,
    string? ImageUrl);

public record VehiclePartResponseDto(
    long Id,
    string Name,
    string? Description,
    string? Category,
    decimal Price,
    int StockQuantity,
    long VendorId,
    string VendorName,
    string? ImageUrl);
