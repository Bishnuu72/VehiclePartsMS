namespace VehiclePartsMS.Application.DTOs;

public record FinancialReportDto(
    decimal TotalRevenue,
    int TotalInvoices,
    decimal TotalDiscountGiven,
    DateTime StartDate,
    DateTime EndDate,
    string ReportType // "Daily", "Monthly", "Yearly"
);
