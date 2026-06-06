namespace VehiclePartsMS.Application.DTOs;

public record VehicleCreateDto(
    string VehicleNumber,
    string? Make,
    string? Model,
    int? Year);

public record VehicleResponseDto(
    long Id,
    string VehicleNumber,
    string? Make,
    string? Model,
    int? Year,
    string? ImageUrl);

public record CustomerRegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? Address,
    string? Phone,
    List<VehicleCreateDto>? Vehicles);

public record CustomerUpdateDto(
    string? Address,
    string? Phone);

public record VehicleUpdateDto(
    string VehicleNumber,
    string? Make,
    string? Model,
    int? Year);

public record CustomerResponseDto(
    long Id,
    long UserId,
    string FullName,
    string Email,
    string? Phone,
    string? Address,
    decimal TotalSpent,
    decimal CreditBalance,
    List<VehicleResponseDto> Vehicles);

public record InvoiceSummaryDto(
    long Id,
    DateTime SaleDate,
    decimal SubTotal,
    decimal DiscountPercent,
    decimal TotalAmount,
    string PaymentStatus,
    int ItemCount);

public record AppointmentSummaryDto(
    long Id,
    DateTime AppointmentDate,
    string? VehicleNumber,
    string Status,
    string? Notes);

public record CustomerDetailDto(
    long Id,
    long UserId,
    string FullName,
    string Email,
    string? Phone,
    string? Address,
    decimal TotalSpent,
    decimal CreditBalance,
    List<VehicleResponseDto> Vehicles,
    List<InvoiceSummaryDto> PurchaseHistory,
    List<AppointmentSummaryDto> ServiceHistory);

public record CustomerReportItemDto(
    long Id,
    string FullName,
    string Email,
    string? Phone,
    decimal TotalSpent,
    decimal CreditBalance,
    int PurchaseCount);
