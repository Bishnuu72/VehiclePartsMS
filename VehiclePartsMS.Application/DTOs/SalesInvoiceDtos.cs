using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.DTOs;

public record SalesInvoiceItemCreateDto(
    long PartId,
    int Quantity);

public record SalesInvoiceCreateDto(
    long CustomerProfileId,
    long StaffId,
    PaymentStatus PaymentStatus,
    List<SalesInvoiceItemCreateDto> Items);

public record SalesInvoicePaymentStatusUpdateDto(
    PaymentStatus PaymentStatus);

public record SalesInvoiceItemResponseDto(
    long Id,
    long PartId,
    string PartName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

public record SalesInvoiceResponseDto(
    long Id,
    long CustomerProfileId,
    string CustomerName,
    long StaffId,
    string StaffName,
    DateTime SaleDate,
    decimal SubTotal,
    decimal DiscountPercent,
    decimal TotalAmount,
    string PaymentStatus,
    List<SalesInvoiceItemResponseDto> Items);
