using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class PartRequestService(
    IPartRequestRepository repo,
    ICustomerRepository customerRepo,
    IEmailService emailService) : IPartRequestService
{
    public async Task<IEnumerable<PartRequestResponseDto>> GetAllAsync()
        => await repo.GetAllAsync();

    public async Task<PartRequestResponseDto> CreateAsync(PartRequestCreateDto dto)
    {
        _ = await customerRepo.FindByIdAsync(dto.CustomerProfileId)
            ?? throw new KeyNotFoundException($"Customer profile {dto.CustomerProfileId} not found.");

        var request = new PartRequest
        {
            CustomerProfileId = dto.CustomerProfileId,
            PartName          = dto.PartName,
            Description       = dto.Description
        };

        var created = await repo.CreateAsync(request);

        var all = await repo.GetAllAsync();
        return all.First(r => r.Id == created.Id);
    }

    public async Task<PartRequestResponseDto> UpdateAsync(long id, PartRequestUpdateDto dto)
    {
        var request = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Part request {id} not found.");

        request.PartName    = dto.PartName;
        request.Description  = dto.Description;

        await repo.UpdateAsync(request);

        var all = await repo.GetAllAsync();
        return all.First(r => r.Id == id);
    }

    public async Task<PartRequestResponseDto> UpdateStatusAsync(long id, PartRequestStatus status)
    {
        var request = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Part request {id} not found.");

        var changed = request.Status != status;
        request.Status = status;
        await repo.UpdateAsync(request);

        // Notify the customer when their request is resolved (Available/Unavailable).
        if (changed && status is PartRequestStatus.Available or PartRequestStatus.Unavailable)
        {
            try
            {
                var customer = await customerRepo.FindByIdAsync(request.CustomerProfileId);
                var email = customer?.User.Email;
                if (!string.IsNullOrWhiteSpace(email))
                {
                    var name = $"{customer!.User.FirstName} {customer.User.LastName}".Trim();
                    var (subject, html) = status == PartRequestStatus.Available
                        ? ($"Good news — \"{request.PartName}\" is now available",
                           $"""
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              Hi {System.Net.WebUtility.HtmlEncode(name)},
                            </p>
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              Great news! The part you requested —
                              <strong>{System.Net.WebUtility.HtmlEncode(request.PartName)}</strong> —
                              is now <strong style="color:#15803d;">available</strong> in our inventory.
                            </p>
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              Next step: visit the store or contact our staff to purchase it. Quote your
                              request so we can serve you faster. We hold availability subject to stock.
                            </p>
                            <p style="margin:0;font-size:13px;color:#9ca3af;">Thank you for choosing VehiclePartsMS.</p>
                            """)
                        : ($"Update on your part request — \"{request.PartName}\"",
                           $"""
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              Hi {System.Net.WebUtility.HtmlEncode(name)},
                            </p>
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              Unfortunately we were unable to source the part you requested —
                              <strong>{System.Net.WebUtility.HtmlEncode(request.PartName)}</strong>.
                              It is currently marked <strong style="color:#b91c1c;">unavailable</strong>.
                            </p>
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3f3f46;">
                              You're welcome to submit a new request later or contact our staff for
                              alternatives and compatible options.
                            </p>
                            <p style="margin:0;font-size:13px;color:#9ca3af;">Thank you for your patience.</p>
                            """);
                    await emailService.SendAsync(email, subject, html, isHtml: true);
                }
            }
            catch { /* email failure must not block the status update */ }
        }

        var all = await repo.GetAllAsync();
        return all.First(r => r.Id == id);
    }

    public async Task DeleteAsync(long id)
    {
        var request = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Part request {id} not found.");

        await repo.DeleteAsync(request);
    }
}
