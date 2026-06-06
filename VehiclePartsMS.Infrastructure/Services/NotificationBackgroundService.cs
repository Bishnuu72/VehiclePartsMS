using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Infrastructure.Services;

public class NotificationBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<NotificationBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Notification background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await RunChecksAsync();
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task RunChecksAsync()
    {
        using var scope = scopeFactory.CreateScope();

        var partRepo    = scope.ServiceProvider.GetRequiredService<IVehiclePartRepository>();
        var invoiceRepo = scope.ServiceProvider.GetRequiredService<ISalesInvoiceRepository>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var config      = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var adminEmail = config["EmailSettings:AdminEmail"] ?? string.Empty;

        await NotifyLowStockAsync(partRepo, emailService, adminEmail);
        await SendOverdueCreditRemindersAsync(invoiceRepo, emailService);
    }

    private async Task NotifyLowStockAsync(
        IVehiclePartRepository partRepo,
        IEmailService emailService,
        string adminEmail)
    {
        var lowStockParts = (await partRepo.GetLowStockAsync(10)).ToList();
        if (!lowStockParts.Any() || string.IsNullOrWhiteSpace(adminEmail)) return;

        var lines = lowStockParts.Select(p => $"  - {p.Name} (ID: {p.Id}): {p.StockQuantity} units left");

        var body = $"""
            Low Stock Alert — {DateTime.UtcNow:dd MMM yyyy}

            The following parts have fallen below 10 units:

            {string.Join("\n", lines)}

            Please restock as soon as possible.
            """;

        try
        {
            await emailService.SendAsync(adminEmail, "Low Stock Alert - VehiclePartsMS", body);
            logger.LogInformation("Low stock alert sent for {Count} parts.", lowStockParts.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send low stock alert email.");
        }
    }

    private async Task SendOverdueCreditRemindersAsync(
        ISalesInvoiceRepository invoiceRepo,
        IEmailService emailService)
    {
        var overdueInvoices = await invoiceRepo.GetOverdueCreditInvoicesAsync();

        foreach (var invoice in overdueInvoices)
        {
            var customerEmail = invoice.CustomerProfile.User.Email;
            var customerName  = $"{invoice.CustomerProfile.User.FirstName} {invoice.CustomerProfile.User.LastName}";

            if (string.IsNullOrWhiteSpace(customerEmail)) continue;

            var body = $"""
                Dear {customerName},

                This is a friendly reminder that Invoice #{invoice.Id} from {invoice.SaleDate:dd MMM yyyy}
                with an outstanding balance of {invoice.TotalAmount:C} is overdue by more than one month.

                Please settle your payment at your earliest convenience.

                Thank you,
                VehiclePartsMS
                """;

            try
            {
                await emailService.SendAsync(customerEmail, $"Payment Reminder - Invoice #{invoice.Id}", body);
                logger.LogInformation("Credit reminder sent to {Email} for invoice #{Id}.", customerEmail, invoice.Id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send credit reminder to {Email}.", customerEmail);
            }
        }
    }
}
