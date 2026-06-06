using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class CustomerRepository(ApplicationDbContext context) : ICustomerRepository
{
    public async Task<IEnumerable<CustomerResponseDto>> GetAllAsync()
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Select(c => new CustomerResponseDto(
                c.Id,
                c.UserId,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.Address,
                c.TotalSpent,
                c.CreditBalance,
                c.Vehicles.Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl)).ToList()))
            .ToListAsync();

    public async Task<IEnumerable<CustomerResponseDto>> SearchAsync(string? name, string? phone, string? vehicleNumber, long? id)
    {
        var query = context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .AsQueryable();

        if (id.HasValue)
            query = query.Where(c => c.Id == id.Value);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(c =>
                (c.User.FirstName + " " + c.User.LastName).ToLower().Contains(name.ToLower()));

        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(c => c.User.PhoneNumber != null &&
                c.User.PhoneNumber.Contains(phone));

        if (!string.IsNullOrWhiteSpace(vehicleNumber))
            query = query.Where(c =>
                c.Vehicles.Any(v => v.VehicleNumber.ToLower().Contains(vehicleNumber.ToLower())));

        return await query
            .Select(c => new CustomerResponseDto(
                c.Id,
                c.UserId,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.Address,
                c.TotalSpent,
                c.CreditBalance,
                c.Vehicles.Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl)).ToList()))
            .ToListAsync();
    }

    public async Task<IEnumerable<CustomerReportItemDto>> GetTopSpendersAsync(int top)
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.SalesInvoices)
            .OrderByDescending(c => c.TotalSpent)
            .Take(top)
            .Select(c => new CustomerReportItemDto(
                c.Id,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.TotalSpent,
                c.CreditBalance,
                c.SalesInvoices.Count))
            .ToListAsync();

    public async Task<IEnumerable<CustomerReportItemDto>> GetRegularCustomersAsync(int top)
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.SalesInvoices)
            .OrderByDescending(c => c.SalesInvoices.Count)
            .Take(top)
            .Select(c => new CustomerReportItemDto(
                c.Id,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.TotalSpent,
                c.CreditBalance,
                c.SalesInvoices.Count))
            .ToListAsync();

    public async Task<IEnumerable<CustomerReportItemDto>> GetPendingCreditsAsync()
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.SalesInvoices)
            .Where(c => c.CreditBalance > 0)
            .OrderByDescending(c => c.CreditBalance)
            .Select(c => new CustomerReportItemDto(
                c.Id,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.TotalSpent,
                c.CreditBalance,
                c.SalesInvoices.Count))
            .ToListAsync();

    public async Task<CustomerProfile?> FindByIdAsync(long id)
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<CustomerProfile?> FindByIdWithHistoryAsync(long id)
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Include(c => c.SalesInvoices).ThenInclude(i => i.Items)
            .Include(c => c.Appointments).ThenInclude(a => a.Vehicle)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<CustomerProfile> AddAsync(CustomerProfile customer)
    {
        context.CustomerProfiles.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    public async Task UpdateAsync(CustomerProfile customer)
    {
        context.CustomerProfiles.Update(customer);
        await context.SaveChangesAsync();
    }

    public async Task<CustomerResponseDto?> GetByUserIdAsync(long userId)
        => await context.CustomerProfiles
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Where(c => c.UserId == userId)
            .Select(c => new CustomerResponseDto(
                c.Id,
                c.UserId,
                c.User.FirstName + " " + c.User.LastName,
                c.User.Email!,
                c.User.PhoneNumber,
                c.Address,
                c.TotalSpent,
                c.CreditBalance,
                c.Vehicles.Select(v => new VehicleResponseDto(v.Id, v.VehicleNumber, v.Make, v.Model, v.Year, v.ImageUrl)).ToList()))
            .FirstOrDefaultAsync();

    public async Task<bool> ExistsByUserIdAsync(long userId)
        => await context.CustomerProfiles.AnyAsync(c => c.UserId == userId);

    public async Task<Vehicle?> FindVehicleAsync(long customerId, long vehicleId)
        => await context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerProfileId == customerId);

    public async Task<VehicleResponseDto> AddVehicleAsync(long customerId, Vehicle vehicle)
    {
        vehicle.CustomerProfileId = customerId;
        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();
        return new VehicleResponseDto(vehicle.Id, vehicle.VehicleNumber, vehicle.Make, vehicle.Model, vehicle.Year, vehicle.ImageUrl);
    }

    public async Task UpdateVehicleAsync(Vehicle vehicle)
    {
        context.Vehicles.Update(vehicle);
        await context.SaveChangesAsync();
    }

    public async Task DeleteVehicleAsync(Vehicle vehicle)
    {
        context.Vehicles.Remove(vehicle);
        await context.SaveChangesAsync();
    }
}
