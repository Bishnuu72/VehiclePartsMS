using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

public class ReviewService(
    IReviewRepository repo,
    ICustomerRepository customerRepo) : IReviewService
{
    public async Task<IEnumerable<ReviewResponseDto>> GetAllAsync()
        => await repo.GetAllAsync();

    public async Task<ReviewResponseDto> CreateAsync(ReviewCreateDto dto)
    {
        _ = await customerRepo.FindByIdAsync(dto.CustomerProfileId)
            ?? throw new KeyNotFoundException($"Customer profile {dto.CustomerProfileId} not found.");

        if (dto.Rating < 1 || dto.Rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.");

        var review = new Review
        {
            CustomerProfileId = dto.CustomerProfileId,
            Rating            = dto.Rating,
            Comment           = dto.Comment
        };

        var created = await repo.CreateAsync(review);

        var all = await repo.GetAllAsync();
        return all.First(r => r.Id == created.Id);
    }
}
