using Microsoft.AspNetCore.Mvc;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PurchaseInvoicesController(IPurchaseInvoiceService service) : ControllerBase
{
    // GET: api/purchaseinvoices
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseInvoiceResponseDto>>> GetAll()
        => Ok(await service.GetAllAsync());

    // GET: api/purchaseinvoices/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseInvoiceResponseDto>> GetById(long id)
    {
        var invoice = await service.GetByIdAsync(id);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    // POST: api/purchaseinvoices
    [HttpPost]
    public async Task<ActionResult<PurchaseInvoiceResponseDto>> Create(PurchaseInvoiceCreateDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}
