using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Persistance;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole<long>> roleManager)
    {
        await context.Database.MigrateAsync();

        // Seed Roles
        string[] roles = { "Admin", "Staff", "Customer" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<long>(roleName));
            }
        }

        // Seed Admin User
        var adminEmail = "admin@vehicleparts.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var admin = new User
            {
                FirstName = "System",
                LastName = "Admin",
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
