using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class SalesInvoiceService(
    ISalesInvoiceRepository invoiceRepo,
    IVehiclePartRepository partRepo,
    ICustomerRepository customerRepo,
    IEmailService emailService) : ISalesInvoiceService
{
    private const decimal LoyaltyThreshold  = 5000m;
    private const decimal LoyaltyDiscount   = 10m;

    public async Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync()
        => await invoiceRepo.GetAllAsync();

    public async Task<SalesInvoiceResponseDto?> GetByIdAsync(long id)
    {
        var invoice = await invoiceRepo.FindByIdAsync(id);
        if (invoice is null) return null;
        return MapToDto(invoice);
    }

    public async Task<SalesInvoiceResponseDto> CreateAsync(SalesInvoiceCreateDto dto)
    {
        var customer = await customerRepo.FindByIdAsync(dto.CustomerProfileId)
            ?? throw new KeyNotFoundException($"Customer profile {dto.CustomerProfileId} not found.");

        // Validate parts and calculate subtotal
        var lineItems = new List<(VehiclePart Part, int Quantity)>();
        decimal subTotal = 0;

        foreach (var item in dto.Items)
        {
            var part = await partRepo.FindByIdAsync(item.PartId)
                ?? throw new KeyNotFoundException($"Part {item.PartId} not found.");

            if (part.StockQuantity < item.Quantity)
                throw new InvalidOperationException(
                    $"Insufficient stock for '{part.Name}'. Available: {part.StockQuantity}, Requested: {item.Quantity}.");

            lineItems.Add((part, item.Quantity));
            subTotal += part.Price * item.Quantity;
        }

        // Feature 16: 10% loyalty discount if single purchase exceeds 5000
        decimal discountPercent = subTotal > LoyaltyThreshold ? LoyaltyDiscount : 0m;
        decimal totalAmount     = subTotal - (subTotal * discountPercent / 100m);

        // Deduct stock
        foreach (var (part, qty) in lineItems)
        {
            part.StockQuantity -= qty;
            await partRepo.UpdateAsync(part);
        }

        // Update customer total spent. Credit sales also accrue to the
        // customer's outstanding credit balance so it surfaces consistently
        // across the customer, staff and admin views (single source of truth).
        customer.TotalSpent += totalAmount;
        if (dto.PaymentStatus == PaymentStatus.Credit)
            customer.CreditBalance += totalAmount;
        await customerRepo.UpdateAsync(customer);

        var invoice = new SalesInvoice
        {
            CustomerProfileId = dto.CustomerProfileId,
            StaffId           = dto.StaffId,
            SubTotal          = subTotal,
            DiscountPercent   = discountPercent,
            TotalAmount       = totalAmount,
            PaymentStatus     = dto.PaymentStatus,
            Items = lineItems.Select(x => new SalesInvoiceItem
            {
                PartId    = x.Part.Id,
                Quantity  = x.Quantity,
                UnitPrice = x.Part.Price
            }).ToList()
        };

        var created = await invoiceRepo.CreateAsync(invoice);

        // Reload with navigation properties for the response
        var full = await invoiceRepo.FindByIdAsync(created.Id)
            ?? throw new Exception("Failed to load created invoice.");

        return MapToDto(full);
    }

    public async Task<SalesInvoiceResponseDto> UpdatePaymentStatusAsync(long id, PaymentStatus newStatus)
    {
        var invoice = await invoiceRepo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Invoice {id} not found.");

        if (invoice.PaymentStatus == newStatus)
            return MapToDto(invoice);

        var customer = await customerRepo.FindByIdAsync(invoice.CustomerProfileId)
            ?? throw new KeyNotFoundException($"Customer profile {invoice.CustomerProfileId} not found.");

        // Keep the customer's outstanding credit balance in sync with the
        // invoice's payment status. Clamp at zero so corrections never push
        // the balance negative.
        if (invoice.PaymentStatus == PaymentStatus.Credit && newStatus == PaymentStatus.Paid)
            customer.CreditBalance = Math.Max(0m, customer.CreditBalance - invoice.TotalAmount);
        else if (invoice.PaymentStatus == PaymentStatus.Paid && newStatus == PaymentStatus.Credit)
            customer.CreditBalance += invoice.TotalAmount;

        invoice.PaymentStatus = newStatus;

        await customerRepo.UpdateAsync(customer);
        await invoiceRepo.UpdateAsync(invoice);

        var full = await invoiceRepo.FindByIdAsync(id)
            ?? throw new Exception("Failed to reload updated invoice.");

        return MapToDto(full);
    }

    public async Task SendInvoiceEmailAsync(long invoiceId)
    {
        var invoice = await invoiceRepo.FindByIdAsync(invoiceId)
            ?? throw new KeyNotFoundException($"Invoice {invoiceId} not found.");

        var customerEmail = invoice.CustomerProfile.User.Email!;
        var customerName  = $"{invoice.CustomerProfile.User.FirstName} {invoice.CustomerProfile.User.LastName}";

        string Money(decimal v) => $"NPR {v:N2}";
        var rows = string.Join("", invoice.Items.Select(i => $"""
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#0f1115;">{System.Net.WebUtility.HtmlEncode(i.Part.Name)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#6b7280;text-align:center;">{i.Quantity}</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#6b7280;text-align:right;">{Money(i.UnitPrice)}</td>
              <td style="padding:10px 0;border-bottom:1px solid #f0f0f2;font-size:14px;color:#0f1115;text-align:right;font-weight:600;">{Money(i.Quantity * i.UnitPrice)}</td>
            </tr>
            """));

        var paid = invoice.PaymentStatus == PaymentStatus.Paid;
        var statusBadge =
            $"<span style=\"display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;" +
            $"font-weight:700;background:{(paid ? "#dcfce7" : "#fef3c7")};" +
            $"color:{(paid ? "#15803d" : "#b45309")};\">{invoice.PaymentStatus}</span>";

        var discountRow = invoice.DiscountPercent > 0
            ? $"<tr><td style=\"padding:4px 0;font-size:14px;color:#15803d;\">Loyalty discount ({invoice.DiscountPercent}%)</td>" +
              $"<td style=\"padding:4px 0;font-size:14px;color:#15803d;text-align:right;\">-{Money(invoice.SubTotal - invoice.TotalAmount)}</td></tr>"
            : "";

        var html = $"""
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#3f3f46;">
              Dear {System.Net.WebUtility.HtmlEncode(customerName)},<br>
              Thank you for your purchase. Here is your invoice summary.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
              <tr>
                <td style="font-size:13px;color:#6b7280;">Invoice <strong style="color:#0f1115;">#{invoice.Id}</strong></td>
                <td style="font-size:13px;color:#6b7280;text-align:right;">{invoice.SaleDate:dd MMM yyyy}</td>
              </tr>
              <tr><td colspan="2" style="padding-top:6px;">{statusBadge}</td></tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <th align="left" style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;border-bottom:2px solid #eef0f2;">Item</th>
                <th align="center" style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;border-bottom:2px solid #eef0f2;">Qty</th>
                <th align="right" style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;border-bottom:2px solid #eef0f2;">Unit</th>
                <th align="right" style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;border-bottom:2px solid #eef0f2;">Total</th>
              </tr>
              {rows}
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Subtotal</td>
                  <td style="padding:4px 0;font-size:14px;color:#6b7280;text-align:right;">{Money(invoice.SubTotal)}</td></tr>
              {discountRow}
              <tr><td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#0f1115;border-top:2px solid #eef0f2;">Total</td>
                  <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#0f1115;text-align:right;border-top:2px solid #eef0f2;">{Money(invoice.TotalAmount)}</td></tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#9ca3af;">
              Thank you for choosing VehiclePartsMS.
            </p>
            """;

        await emailService.SendAsync(
            customerEmail, $"Invoice #{invoice.Id} - VehiclePartsMS", html, isHtml: true);
    }

    private static SalesInvoiceResponseDto MapToDto(SalesInvoice i)
        => new(
            i.Id,
            i.CustomerProfileId,
            $"{i.CustomerProfile.User.FirstName} {i.CustomerProfile.User.LastName}",
            i.StaffId,
            $"{i.Staff.FirstName} {i.Staff.LastName}",
            i.SaleDate,
            i.SubTotal,
            i.DiscountPercent,
            i.TotalAmount,
            i.PaymentStatus.ToString(),
            i.Items.Select(item => new SalesInvoiceItemResponseDto(
                item.Id,
                item.PartId,
                item.Part.Name,
                item.Quantity,
                item.UnitPrice,
                item.Quantity * item.UnitPrice)).ToList());
}
