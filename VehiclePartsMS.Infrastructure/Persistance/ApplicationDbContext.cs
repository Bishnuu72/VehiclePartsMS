using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Persistance;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
    : IdentityDbContext<User, IdentityRole<long>, long>(options)
{
    public DbSet<VehiclePart> VehicleParts { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<CustomerProfile> CustomerProfiles { get; set; }
    public DbSet<SalesInvoice> SalesInvoices { get; set; }
    public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
    public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
    public DbSet<ServiceAppointment> ServiceAppointments { get; set; }
    public DbSet<PartRequest> PartRequests { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relations
        modelBuilder.Entity<SalesInvoice>()
            .HasOne(i => i.Staff)
            .WithMany(u => u.SalesInvoicesAsStaff)
            .HasForeignKey(i => i.StaffId);

        modelBuilder.Entity<CustomerProfile>()
            .HasOne(c => c.User)
            .WithOne(u => u.CustomerProfile)
            .HasForeignKey<CustomerProfile>(c => c.UserId);
            
        modelBuilder.Entity<VehiclePart>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.Parts)
            .HasForeignKey(p => p.VendorId);

        modelBuilder.Entity<PurchaseInvoice>()
            .HasOne(p => p.Admin)
            .WithMany()
            .HasForeignKey(p => p.AdminId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
