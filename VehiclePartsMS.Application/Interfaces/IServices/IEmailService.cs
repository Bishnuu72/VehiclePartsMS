namespace VehiclePartsMS.Application.Interfaces.IServices;

public interface IEmailService
{
    /// <param name="isHtml">
    /// false (default): <paramref name="body"/> is plain text — HTML-escaped,
    /// line breaks preserved, wrapped in the branded template.
    /// true: <paramref name="body"/> is trusted HTML, injected into the template as-is.
    /// </param>
    Task SendAsync(string to, string subject, string body, bool isHtml = false);
}
