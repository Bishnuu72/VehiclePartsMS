using VehiclePartsMS.Application.DTOs;

namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IFinancialReportService
{
    Task<FinancialReportDto> GetDailyReportAsync(DateTime date);
    Task<FinancialReportDto> GetMonthlyReportAsync(int year, int month);
    Task<FinancialReportDto> GetYearlyReportAsync(int year);
}
