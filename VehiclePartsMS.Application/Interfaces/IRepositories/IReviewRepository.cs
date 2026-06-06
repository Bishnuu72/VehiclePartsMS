using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.Interfaces.IRepositories;

public interface IReviewRepository
{
    Task<IEnumerable<ReviewResponseDto>> GetAllAsync();
    Task<Review> CreateAsync(Review review);
}
