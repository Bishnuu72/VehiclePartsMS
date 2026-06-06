namespace VehiclePartsMS.Application.DTOs;

public record PurchaseInvoiceItemCreateDto(
    long PartId,
    int Quantity,
    decimal UnitCost);

public record PurchaseInvoiceCreateDto(
    long VendorId,
    long AdminId,
    List<PurchaseInvoiceItemCreateDto> Items);

public record PurchaseInvoiceItemResponseDto(
    long Id,
    long PartId,
    string PartName,
    int Quantity,
    decimal UnitCost,
    decimal LineTotal);

public record PurchaseInvoiceResponseDto(
    long Id,
    long VendorId,
    string VendorName,
    long AdminId,
    string AdminName,
    DateTime PurchaseDate,
    decimal TotalAmount,
    List<PurchaseInvoiceItemResponseDto> Items);
