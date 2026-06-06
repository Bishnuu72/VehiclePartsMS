using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Infrastructure.Services;

public class FinancialReportService(ISalesInvoiceRepository repo) : IFinancialReportService
{
    public async Task<FinancialReportDto> GetDailyReportAsync(DateTime date)
    {
        var start = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var end   = start.AddDays(1).AddTicks(-1);
        return await GenerateReportAsync(start, end, "Daily");
    }

    public async Task<FinancialReportDto> GetMonthlyReportAsync(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = start.AddMonths(1).AddTicks(-1);
        return await GenerateReportAsync(start, end, "Monthly");
    }

    public async Task<FinancialReportDto> GetYearlyReportAsync(int year)
    {
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end   = start.AddYears(1).AddTicks(-1);
        return await GenerateReportAsync(start, end, "Yearly");
    }

    private async Task<FinancialReportDto> GenerateReportAsync(DateTime start, DateTime end, string type)
    {
        var invoices = await repo.GetInvoicesInDateRangeAsync(start, end);
        
        decimal totalRevenue = 0;
        decimal totalDiscount = 0;
        int count = 0;

        foreach (var invoice in invoices)
        {
            totalRevenue += invoice.TotalAmount;
            totalDiscount += (invoice.SubTotal * (invoice.DiscountPercent / 100));
            count++;
        }

        return new FinancialReportDto(totalRevenue, count, totalDiscount, start, end, type);
    }
}
