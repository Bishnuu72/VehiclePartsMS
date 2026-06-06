using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Application.DTOs;

// Appointments
public record AppointmentCreateDto(
    long CustomerProfileId,
    long? VehicleId,
    DateTime AppointmentDate,
    string? Notes);

public record AppointmentUpdateDto(
    long? VehicleId,
    DateTime AppointmentDate,
    string? Notes,
    AppointmentStatus Status);

public record AppointmentResponseDto(
    long Id,
    long CustomerProfileId,
    string CustomerName,
    long? VehicleId,
    string? VehicleNumber,
    DateTime AppointmentDate,
    string Status,
    string? Notes,
    DateTime CreatedAt);

// Part Requests
public record PartRequestCreateDto(
    long CustomerProfileId,
    string PartName,
    string? Description);

public record PartRequestUpdateDto(
    string PartName,
    string? Description);

public record PartRequestStatusUpdateDto(
    PartRequestStatus Status);

public record PartRequestResponseDto(
    long Id,
    long CustomerProfileId,
    string CustomerName,
    string PartName,
    string? Description,
    DateTime RequestDate,
    string Status);

// Reviews
public record ReviewCreateDto(
    long CustomerProfileId,
    int Rating,
    string? Comment);

public record ReviewResponseDto(
    long Id,
    long CustomerProfileId,
    string CustomerName,
    int Rating,
    string? Comment,
    DateTime ReviewDate);
