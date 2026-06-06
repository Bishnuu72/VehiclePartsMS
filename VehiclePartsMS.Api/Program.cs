using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VehiclePartsMS.Api.Middleware;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;
using VehiclePartsMS.Infrastructure.Repositories;
using VehiclePartsMS.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("defaultConnection")));

// Identity
builder.Services.AddIdentity<User, IdentityRole<long>>(options => {
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Authentication
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Repositories
builder.Services.AddScoped<IVehiclePartRepository,    VehiclePartRepository>();
builder.Services.AddScoped<IVendorRepository,         VendorRepository>();
builder.Services.AddScoped<ISalesInvoiceRepository,   SalesInvoiceRepository>();
builder.Services.AddScoped<ICustomerRepository,       CustomerRepository>();
builder.Services.AddScoped<IPurchaseInvoiceRepository, PurchaseInvoiceRepository>();
builder.Services.AddScoped<IAppointmentRepository,     AppointmentRepository>();
builder.Services.AddScoped<IPartRequestRepository,     PartRequestRepository>();
builder.Services.AddScoped<IReviewRepository,          ReviewRepository>();

// Services
builder.Services.AddScoped<IUserService,              UserService>();
builder.Services.AddScoped<IVehiclePartService,       VehiclePartService>();
builder.Services.AddScoped<IVendorService,            VendorService>();
builder.Services.AddScoped<IFinancialReportService,   FinancialReportService>();
builder.Services.AddScoped<ICustomerService,          CustomerService>();
builder.Services.AddScoped<ISalesInvoiceService,      SalesInvoiceService>();
builder.Services.AddScoped<IPurchaseInvoiceService,   PurchaseInvoiceService>();
builder.Services.AddScoped<IAppointmentService,       AppointmentService>();
builder.Services.AddScoped<IPartRequestService,       PartRequestService>();
builder.Services.AddScoped<IReviewService,            ReviewService>();
builder.Services.AddScoped<IEmailService,             EmailService>();
builder.Services.AddHostedService<NotificationBackgroundService>();

// AI assistant (Gemini) — typed HttpClient
builder.Services.AddHttpClient<IChatService, ChatService>();

var app = builder.Build();

// Initialization
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<long>>>();
    await DbSeeder.SeedAsync(context, userManager, roleManager);
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
