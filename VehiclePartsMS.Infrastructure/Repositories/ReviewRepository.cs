using Microsoft.EntityFrameworkCore;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Domain.Models;
using VehiclePartsMS.Infrastructure.Persistance;

namespace VehiclePartsMS.Infrastructure.Repositories;

public class ReviewRepository(ApplicationDbContext context) : IReviewRepository
{
    public async Task<IEnumerable<ReviewResponseDto>> GetAllAsync()
        => await context.Reviews
            .Include(r => r.CustomerProfile).ThenInclude(c => c.User)
            .Select(r => new ReviewResponseDto(
                r.Id,
                r.CustomerProfileId,
                r.CustomerProfile.User.FirstName + " " + r.CustomerProfile.User.LastName,
                r.Rating,
                r.Comment,
                r.ReviewDate))
            .ToListAsync();

    public async Task<Review> CreateAsync(Review review)
    {
        context.Reviews.Add(review);
        await context.SaveChangesAsync();
        return review;
    }
}
