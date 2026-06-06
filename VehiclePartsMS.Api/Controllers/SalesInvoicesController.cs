using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SalesInvoicesController(ISalesInvoiceService service) : ControllerBase
{
    // GET: api/salesinvoices
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesInvoiceResponseDto>>> GetAll()
        => Ok(await service.GetAllAsync());

    // GET: api/salesinvoices/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesInvoiceResponseDto>> GetById(long id)
    {
        var invoice = await service.GetByIdAsync(id);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    // POST: api/salesinvoices
    [HttpPost]
    public async Task<ActionResult<SalesInvoiceResponseDto>> Create(SalesInvoiceCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT: api/salesinvoices/{id}/payment-status
    [HttpPut("{id}/payment-status")]
    public async Task<ActionResult<SalesInvoiceResponseDto>> UpdatePaymentStatus(
        long id, SalesInvoicePaymentStatusUpdateDto dto)
    {
        var updated = await service.UpdatePaymentStatusAsync(id, dto.PaymentStatus);
        return Ok(updated);
    }

    // POST: api/salesinvoices/{id}/send-email
    [HttpPost("{id}/send-email")]
    public async Task<IActionResult> SendEmail(long id)
    {
        await service.SendInvoiceEmailAsync(id);
        return Ok(new { message = $"Invoice #{id} sent to customer email." });
    }
}
