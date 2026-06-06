# Vehicle Parts Management System (Backend)

## Overview
The **Vehicle Parts Management System** backend is a robust, modular .NET solution that provides a RESTful API for managing vehicle parts, vendors, customers, and related business processes. It follows clean architecture principles, separating concerns into **Domain**, **Application**, **Infrastructure**, and **Api** layers.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup & Development](#setup--development)
- [Running the API](#running-the-api)
- [Testing](#testing)
- [CI/CD & Deployment](#cicd--deployment)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack
- **.NET 8** (C# 12)
- **Entity Framework Core** (EF Core 8) with PostgreSQL provider
- **ASP.NET Core Web API**
- **MediatR** for CQRS pattern
- **AutoMapper** for object mapping
- **FluentValidation** for request validation
- **Swashbuckle (Swagger)** for API documentation
- **xUnit** + **Moq** for unit testing
- **Docker** for containerised development

## Architecture
```
VehiclePartsMS
├─ VehiclePartsMS.Domain          // Entities, enums, value objects
├─ VehiclePartsMS.Application      // Use‑cases, DTOs, interfaces, validators
├─ VehiclePartsMS.Infrastructure   // EF Core DbContext, repositories, migrations
└─ VehiclePartsMS.Api              // Controllers, startup, middleware, swagger
```
- **Domain** contains pure business models without any dependencies.
- **Application** orchestrates business rules via services and MediatR handlers.
- **Infrastructure** implements persistence, external services, and DB migrations.
- **Api** exposes HTTP endpoints, configures DI, authentication, and OpenAPI.

## Prerequisites
- [.NET SDK 8.0](https://dotnet.microsoft.com/download)
- [PostgreSQL 15](https://www.postgresql.org/download/) (or Docker‑compose setup)
- Git (already initialised in the repository)
- Optional: Docker Desktop for containerised DB.

## Setup & Development
1. **Clone the repository** (if not already):
   ```bash
   git clone https://github.com/Bishnuu72/VehiclePartsMS.git
   cd VehiclePartsMS
   ```
2. **Configure the database** – create a `appsettings.Development.json` file in `VehiclePartsMS.Api`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=VehiclePartsDb;Username=postgres;Password=yourpassword"
     }
   }
   ```
3. **Run migrations** to create the schema:
   ```bash
   dotnet ef database update --project ./VehiclePartsMS.Infrastructure
   ```
4. **Start the API** (development mode):
   ```bash
   dotnet run --project ./VehiclePartsMS.Api
   ```
   The API will be reachable at `https://localhost:5001` with Swagger UI at `/swagger`.

## Running with Docker (optional)
```bash
docker compose up -d   # Starts PostgreSQL & the API container
```
The `docker-compose.yml` is located at the repository root.

## Testing
- **Unit tests** are located in `VehiclePartsMS.Tests` (if present). Run them with:
  ```bash
  dotnet test
  ```
- **Integration tests** use an in‑memory PostgreSQL instance; see the `Tests` project README for details.

## CI/CD & Deployment
A simple GitHub Actions workflow (`.github/workflows/ci.yml`) builds, tests, and publishes a Docker image.
- Pull requests trigger the CI pipeline.
- Merges to `main` push the Docker image to GitHub Container Registry.

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes with clear messages.
4. Open a Pull Request targeting `main`.
5. Ensure all tests pass and code follows the existing style.

## License
This project is licensed under the **MIT License** – see the LICENSE file for details.

---
*Happy coding!*
