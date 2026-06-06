using Microsoft.AspNetCore.Identity;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class CustomerService(
    ICustomerRepository repo,
    UserManager<User> userManager) : ICustomerService
{
    public async Task<IEnumerable<CustomerResponseDto>> GetAllAsync()
        => await repo.GetAllAsync();

    public async Task<IEnumerable<CustomerResponseDto>> SearchAsync(string? name, string? phone, string? vehicleNumber, long? id)
        => await repo.SearchAsync(name, phone, vehicleNumber, id);

    public async Task<IEnumerable<CustomerReportItemDto>> GetTopSpendersAsync(int top)
        => await repo.GetTopSpendersAsync(top);

    public async Task<IEnumerable<CustomerReportItemDto>> GetRegularCustomersAsync(int top)
        => await repo.GetRegularCustomersAsync(top);

    public async Task<IEnumerable<CustomerReportItemDto>> GetPendingCreditsAsync()
        => await repo.GetPendingCreditsAsync();

    public async Task<CustomerResponseDto?> GetByIdAsync(long id)
    {
        var customer = await repo.FindByIdAsync(id);
        if (customer is null) return null;

        return MapToDto(customer);
    }

    public Task<CustomerResponseDto?> GetByUserIdAsync(long userId)
        => repo.GetByUserIdAsync(userId);

    public async Task<CustomerResponseDto> EnsureProfileAsync(long userId)
    {
        var existing = await repo.GetByUserIdAsync(userId);
        if (existing is not null) return existing;

        await repo.AddAsync(new CustomerProfile { UserId = userId });
        return (await repo.GetByUserIdAsync(userId))!;
    }

    public async Task<CustomerDetailDto?> GetDetailsAsync(long id)
    {
        var customer = await repo.FindByIdWithHistoryAsync(id);
        if (customer is null) return null;

        var vehicles = customer.Vehicles
            .Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl))
            .ToList();

        var purchaseHistory = customer.SalesInvoices
            .OrderByDescending(i => i.SaleDate)
            .Select(i => new InvoiceSummaryDto(
                i.Id,
                i.SaleDate,
                i.SubTotal,
                i.DiscountPercent,
                i.TotalAmount,
                i.PaymentStatus.ToString(),
                i.Items.Count))
            .ToList();

        var serviceHistory = customer.Appointments
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentSummaryDto(
                a.Id,
                a.AppointmentDate,
                a.Vehicle?.VehicleNumber,
                a.Status.ToString(),
                a.Notes))
            .ToList();

        return new CustomerDetailDto(
            customer.Id,
            customer.UserId,
            $"{customer.User.FirstName} {customer.User.LastName}",
            customer.User.Email!,
            customer.User.PhoneNumber,
            customer.Address,
            customer.TotalSpent,
            customer.CreditBalance,
            vehicles,
            purchaseHistory,
            serviceHistory);
    }

    public async Task<CustomerResponseDto> RegisterAsync(CustomerRegisterDto dto)
    {
        var user = new User
        {
            UserName    = dto.Email,
            Email       = dto.Email,
            FirstName   = dto.FirstName,
            LastName    = dto.LastName,
            PhoneNumber = dto.Phone
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, "Customer");

        var profile = new CustomerProfile
        {
            UserId  = user.Id,
            Address = dto.Address,
            Vehicles = dto.Vehicles?.Select(v => new Vehicle
            {
                VehicleNumber = v.VehicleNumber,
                Make          = v.Make,
                Model         = v.Model,
                Year          = v.Year
            }).ToList() ?? []
        };

        await repo.AddAsync(profile);

        return new CustomerResponseDto(
            profile.Id,
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email!,
            user.PhoneNumber,
            profile.Address,
            profile.TotalSpent,
            profile.CreditBalance,
            profile.Vehicles.Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl)).ToList());
    }

    public async Task UpdateProfileAsync(long id, CustomerUpdateDto dto)
    {
        var customer = await repo.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"Customer profile {id} not found.");

        customer.Address          = dto.Address;
        customer.User.PhoneNumber = dto.Phone;

        await repo.UpdateAsync(customer);
    }

    public async Task<VehicleResponseDto> AddVehicleAsync(long customerId, VehicleCreateDto dto)
    {
        _ = await repo.FindByIdAsync(customerId)
            ?? throw new KeyNotFoundException($"Customer profile {customerId} not found.");

        var vehicle = new Vehicle
        {
            VehicleNumber = dto.VehicleNumber,
            Make          = dto.Make,
            Model         = dto.Model,
            Year          = dto.Year
        };

        return await repo.AddVehicleAsync(customerId, vehicle);
    }

    public async Task UpdateVehicleAsync(long customerId, long vehicleId, VehicleUpdateDto dto)
    {
        var vehicle = await repo.FindVehicleAsync(customerId, vehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {vehicleId} not found for this customer.");

        vehicle.VehicleNumber = dto.VehicleNumber;
        vehicle.Make          = dto.Make;
        vehicle.Model         = dto.Model;
        vehicle.Year          = dto.Year;

        await repo.UpdateVehicleAsync(vehicle);
    }

    public async Task SetVehicleImageUrlAsync(long customerId, long vehicleId, string imageUrl)
    {
        var vehicle = await repo.FindVehicleAsync(customerId, vehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {vehicleId} not found for this customer.");

        vehicle.ImageUrl = imageUrl;
        await repo.UpdateVehicleAsync(vehicle);
    }

    public async Task DeleteVehicleAsync(long customerId, long vehicleId)
    {
        var vehicle = await repo.FindVehicleAsync(customerId, vehicleId)
            ?? throw new KeyNotFoundException($"Vehicle {vehicleId} not found for this customer.");

        await repo.DeleteVehicleAsync(vehicle);
    }

    private static CustomerResponseDto MapToDto(CustomerProfile c)
        => new(
            c.Id,
            c.UserId,
            $"{c.User.FirstName} {c.User.LastName}",
            c.User.Email!,
            c.User.PhoneNumber,
            c.Address,
            c.TotalSpent,
            c.CreditBalance,
            c.Vehicles.Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl)).ToList());
}
