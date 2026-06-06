using System.Net;
using System.Text.RegularExpressions;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using VehiclePartsMS.Application.Interfaces.IServices;

namespace VehiclePartsMS.Infrastructure.Services;

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body, bool isHtml = false)
    {
        var settings = config.GetSection("EmailSettings");

        var innerHtml = isHtml
            ? body
            : $"<p style=\"margin:0;font-size:14px;line-height:1.7;color:#3f3f46;" +
              $"white-space:pre-wrap;\">{WebUtility.HtmlEncode(body)}</p>";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings["FromName"], settings["Username"]));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new BodyBuilder
        {
            HtmlBody = WrapInTemplate(subject, innerHtml),
            TextBody = isHtml ? StripHtml(body) : body,
        }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(settings["Host"], int.Parse(settings["Port"]!), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(settings["Username"], settings["Password"]);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    // Branded, email-client-safe shell (table layout + inline CSS).
    private static string WrapInTemplate(string title, string innerHtml) => $"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:#0f1115;padding:24px 32px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="background:#ffffff;width:34px;height:34px;border-radius:9px;text-align:center;vertical-align:middle;font-weight:800;color:#0f1115;font-size:16px;">V</td>
                    <td style="padding-left:12px;color:#ffffff;font-weight:700;font-size:16px;letter-spacing:-0.02em;">VehiclePartsMS</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:32px;">
                  <h1 style="margin:0 0 18px;font-size:19px;font-weight:700;color:#0f1115;letter-spacing:-0.02em;">{WebUtility.HtmlEncode(title)}</h1>
                  {innerHtml}
                </td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid #eef0f2;background:#fafafa;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                    This is an automated message from VehiclePartsMS — Vehicle Parts Inventory &amp; Management System.<br>
                    &copy; {DateTime.UtcNow:yyyy} VehiclePartsMS. Please do not reply to this email.
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """;

    private static string StripHtml(string html)
        => WebUtility.HtmlDecode(Regex.Replace(html, "<[^>]+>", " "))
            .Replace("  ", " ").Trim();
}
