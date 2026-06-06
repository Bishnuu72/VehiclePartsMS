using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController(IFinancialReportService service) : ControllerBase
{
    // GET: api/reports/daily?date=2024-05-11
    [HttpGet("daily")]
    public async Task<ActionResult<FinancialReportDto>> GetDailyReport([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow;
        return Ok(await service.GetDailyReportAsync(targetDate));
    }

    // GET: api/reports/monthly?year=2024&month=5
    [HttpGet("monthly")]
    public async Task<ActionResult<FinancialReportDto>> GetMonthlyReport([FromQuery] int year, [FromQuery] int month)
    {
        return Ok(await service.GetMonthlyReportAsync(year, month));
    }

    // GET: api/reports/yearly?year=2024
    [HttpGet("yearly")]
    public async Task<ActionResult<FinancialReportDto>> GetYearlyReport([FromQuery] int year)
    {
        return Ok(await service.GetYearlyReportAsync(year));
    }
}
