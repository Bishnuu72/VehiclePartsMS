using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using VehiclePartsMS.Application.DTOs;
using VehiclePartsMS.Application.Interfaces.IRepositories;
using VehiclePartsMS.Application.Interfaces.IServices;
using VehiclePartsMS.Domain.Models;

namespace VehiclePartsMS.Infrastructure.Services;

// Provider-agnostic AI chat service with agentic tool-calling.
// Provider via config "Ai:Provider": "Groq" (default, OpenAI-compatible, supports
// tools) or "Gemini" (text-only fallback, no tools).
public class ChatService(
    HttpClient http,
    IConfiguration config,
    IVehiclePartService partService,
    ICustomerRepository customerRepo,
    ICustomerService customerService,
    IAppointmentService appointmentService,
    IPartRequestService partRequestService) : IChatService
{
    public async Task<ChatResponseDto> AskAsync(
        string message, IEnumerable<ChatMessageDto> history, string role, long? userId)
    {
        if (string.IsNullOrWhiteSpace(message))
            return new ChatResponseDto("Please type a question and I'll do my best to help.");

        var provider = (config["Ai:Provider"] ?? "Groq").Trim();
        var systemPrompt = BuildSystemPrompt(role);
        var hist = (history ?? []).ToList();

        try
        {
            return provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase)
                ? await CallGeminiAsync(systemPrompt, hist, message)
                : await CallGroqWithToolsAsync(provider, systemPrompt, hist, message, role, userId);
        }
        catch
        {
            return new ChatResponseDto(
                "I'm having trouble reaching the AI service right now. Please try again shortly.");
        }
    }

    // ── Groq / OpenAI-compatible with tool-calling loop ──
    private async Task<ChatResponseDto> CallGroqWithToolsAsync(
        string provider, string systemPrompt, List<ChatMessageDto> history,
        string message, string role, long? userId)
    {
        var apiKey = config[$"{provider}:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return new ChatResponseDto(
                $"The AI assistant isn't configured yet. An administrator needs to add a {provider} " +
                $"API key to the server configuration ({provider}:ApiKey) to enable this feature.");

        var baseUrl = (config[$"{provider}:BaseUrl"] ?? "https://api.groq.com/openai/v1").TrimEnd('/');
        var model = config[$"{provider}:Model"] ?? "llama-3.3-70b-versatile";
        var isCustomer = role.Equals("Customer", StringComparison.OrdinalIgnoreCase);

        var messages = new List<object> { new { role = "system", content = systemPrompt } };
        foreach (var m in history)
        {
            var r = m.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "assistant" : "user";
            messages.Add(new { role = r, content = m.Content });
        }
        messages.Add(new { role = "user", content = message });

        var tools = BuildTools(isCustomer);

        // Tool-calling loop: model may request tools; we execute and feed results back.
        for (var iteration = 0; iteration < 5; iteration++)
        {
            var payload = new
            {
                model,
                messages,
                tools,
                tool_choice = "auto",
                temperature = 0.4,
                max_tokens = 900,
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/chat/completions");
            req.Headers.Add("Authorization", $"Bearer {apiKey}");
            req.Content = new StringContent(
                JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var resp = await http.SendAsync(req);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
                return new ChatResponseDto(
                    "The AI service returned an error. Please check the API key/quota and try again.");

            using var doc = JsonDocument.Parse(body);
            var msg = doc.RootElement.GetProperty("choices")[0].GetProperty("message");

            var hasToolCalls = msg.TryGetProperty("tool_calls", out var toolCalls)
                && toolCalls.ValueKind == JsonValueKind.Array
                && toolCalls.GetArrayLength() > 0;

            if (!hasToolCalls)
            {
                var text = msg.TryGetProperty("content", out var c) ? c.GetString() : null;
                return new ChatResponseDto(
                    string.IsNullOrWhiteSpace(text)
                        ? "I couldn't generate a response. Please rephrase your question."
                        : SanitizeReply(text!));
            }

            // Re-append the assistant message verbatim (must include tool_calls).
            messages.Add(msg.Clone());

            foreach (var call in toolCalls.EnumerateArray())
            {
                var callId = call.GetProperty("id").GetString() ?? "";
                var fn = call.GetProperty("function");
                var name = fn.GetProperty("name").GetString() ?? "";
                var argsJson = fn.TryGetProperty("arguments", out var a) ? a.GetString() ?? "{}" : "{}";

                var result = await ExecuteToolAsync(name, argsJson, role, userId);
                messages.Add(new { role = "tool", tool_call_id = callId, content = result });
            }
        }

        return new ChatResponseDto(
            "That request needed too many steps. Please try rephrasing or breaking it up.");
    }

    // ── Tool definitions (OpenAI function-calling schema) ──
    private static object[] BuildTools(bool isCustomer)
    {
        static object Tool(string name, string desc, object props, string[] required) => new
        {
            type = "function",
            function = new
            {
                name,
                description = desc,
                parameters = new { type = "object", properties = props, required },
            },
        };

        if (isCustomer)
        {
            return
            [
                Tool("get_my_vehicles", "List the signed-in customer's registered vehicles.",
                    new { }, []),
                Tool("get_my_appointments", "List the signed-in customer's service appointments.",
                    new { }, []),
                Tool("book_appointment",
                    "Book a new service appointment for the signed-in customer. Confirm details with the user before calling.",
                    new
                    {
                        appointmentDate = new { type = "string", description = "ISO 8601 UTC date-time, e.g. 2026-06-01T10:00:00Z" },
                        vehicleId = new { type = "integer", description = "Optional vehicle id from get_my_vehicles" },
                        notes = new { type = "string", description = "Optional service notes" },
                    },
                    ["appointmentDate"]),
                Tool("cancel_appointment",
                    "Cancel one of the signed-in customer's appointments. Confirm with the user before calling.",
                    new { appointmentId = new { type = "integer", description = "Appointment id" } },
                    ["appointmentId"]),
                Tool("get_my_part_requests", "List the signed-in customer's part requests.",
                    new { }, []),
                Tool("submit_part_request",
                    "Submit a request for a part that is out of stock. Confirm with the user before calling.",
                    new
                    {
                        partName = new { type = "string", description = "Name of the requested part" },
                        description = new { type = "string", description = "Optional extra detail" },
                    },
                    ["partName"]),
            ];
        }

        return
        [
            Tool("get_inventory_overview", "Totals for the parts catalog (count, total stock units).",
                new { }, []),
            Tool("get_low_stock", "List parts at or below a stock threshold (default 10).",
                new { threshold = new { type = "integer", description = "Stock threshold, default 10" } }, []),
            Tool("get_pending_credits", "Customers with outstanding credit and the total owed.",
                new { }, []),
            Tool("get_appointments_overview", "Appointment counts by status and upcoming ones.",
                new { }, []),
            Tool("get_part_requests_overview", "Pending part requests overview.",
                new { }, []),
        ];
    }

    // ── Tool execution (acts strictly as the signed-in user; role-gated) ──
    private async Task<string> ExecuteToolAsync(string name, string argsJson, string role, long? userId)
    {
        try
        {
            using var args = JsonDocument.Parse(string.IsNullOrWhiteSpace(argsJson) ? "{}" : argsJson);
            var root = args.RootElement;
            var isCustomer = role.Equals("Customer", StringComparison.OrdinalIgnoreCase);

            // Staff/Admin read tools
            if (!isCustomer)
            {
                switch (name)
                {
                    case "get_inventory_overview":
                    {
                        var parts = (await partService.GetAllAsync(1, 500)).ToList();
                        return Json(new
                        {
                            totalParts = parts.Count,
                            totalStockUnits = parts.Sum(p => p.StockQuantity),
                            categories = parts.Where(p => p.Category != null)
                                .Select(p => p.Category).Distinct().Count(),
                        });
                    }
                    case "get_low_stock":
                    {
                        var threshold = root.TryGetProperty("threshold", out var t)
                            && t.TryGetInt32(out var tv) ? tv : 10;
                        var low = (await partService.GetAllAsync(1, 500))
                            .Where(p => p.StockQuantity < threshold)
                            .OrderBy(p => p.StockQuantity)
                            .Select(p => new { p.Name, p.StockQuantity, p.Category, p.Price })
                            .Take(40).ToList();
                        return Json(new { count = low.Count, parts = low });
                    }
                    case "get_pending_credits":
                    {
                        var c = (await customerRepo.GetPendingCreditsAsync()).ToList();
                        return Json(new
                        {
                            customers = c.Count,
                            totalOwed = c.Sum(x => x.CreditBalance),
                            top = c.OrderByDescending(x => x.CreditBalance)
                                .Take(10).Select(x => new { x.FullName, x.CreditBalance }),
                        });
                    }
                    case "get_appointments_overview":
                    {
                        var all = (await appointmentService.GetAllAsync()).ToList();
                        return Json(new
                        {
                            total = all.Count,
                            byStatus = all.GroupBy(a => a.Status)
                                .ToDictionary(g => g.Key, g => g.Count()),
                            upcoming = all.Where(a => a.AppointmentDate >= DateTime.UtcNow)
                                .OrderBy(a => a.AppointmentDate).Take(10)
                                .Select(a => new { a.Id, a.CustomerName, a.AppointmentDate, a.Status }),
                        });
                    }
                    case "get_part_requests_overview":
                    {
                        var reqs = (await partRequestService.GetAllAsync()).ToList();
                        var pending = reqs.Where(r => r.Status == "Pending").ToList();
                        return Json(new
                        {
                            total = reqs.Count,
                            pending = pending.Count,
                            items = pending.Take(15).Select(r => new { r.PartName, r.CustomerName }),
                        });
                    }
                }
                return Json(new { error = "Unknown or unauthorized tool for this role." });
            }

            // Customer tools — resolve the caller's own profile; never trust client ids.
            if (userId is null)
                return Json(new { error = "You must be signed in to do that." });

            var profile = await customerService.GetByUserIdAsync(userId.Value);
            if (profile is null)
                return Json(new { error = "No customer profile found for your account." });

            switch (name)
            {
                case "get_my_vehicles":
                    return Json(profile.Vehicles.Select(v => new
                    {
                        v.Id, v.VehicleNumber, v.Make, v.Model, v.Year,
                    }));

                case "get_my_appointments":
                {
                    var mine = (await appointmentService.GetAllAsync())
                        .Where(a => a.CustomerProfileId == profile.Id)
                        .OrderByDescending(a => a.AppointmentDate)
                        .Select(a => new { a.Id, a.AppointmentDate, a.Status, a.VehicleNumber, a.Notes });
                    return Json(mine);
                }

                case "book_appointment":
                {
                    if (!root.TryGetProperty("appointmentDate", out var dEl) ||
                        !DateTime.TryParse(dEl.GetString(), CultureInfo.InvariantCulture,
                            DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out var when))
                        return Json(new { error = "A valid ISO 8601 appointmentDate is required." });

                    long? vehicleId = root.TryGetProperty("vehicleId", out var vEl)
                        && vEl.TryGetInt64(out var vid) ? vid : null;
                    if (vehicleId is not null && profile.Vehicles.All(v => v.Id != vehicleId))
                        return Json(new { error = "That vehicle does not belong to you." });

                    var notes = root.TryGetProperty("notes", out var nEl) ? nEl.GetString() : null;
                    var created = await appointmentService.CreateAsync(
                        new AppointmentCreateDto(profile.Id, vehicleId, when, notes));
                    return Json(new
                    {
                        success = true,
                        appointment = new { created.Id, created.AppointmentDate, created.Status },
                    });
                }

                case "cancel_appointment":
                {
                    if (!root.TryGetProperty("appointmentId", out var aEl) ||
                        !aEl.TryGetInt64(out var apptId))
                        return Json(new { error = "appointmentId is required." });

                    var appt = (await appointmentService.GetAllAsync())
                        .FirstOrDefault(a => a.Id == apptId);
                    if (appt is null || appt.CustomerProfileId != profile.Id)
                        return Json(new { error = "Appointment not found or not yours." });

                    await appointmentService.UpdateAsync(apptId, new AppointmentUpdateDto(
                        appt.VehicleId, appt.AppointmentDate, appt.Notes, AppointmentStatus.Cancelled));
                    return Json(new { success = true, cancelledAppointmentId = apptId });
                }

                case "get_my_part_requests":
                {
                    var mine = (await partRequestService.GetAllAsync())
                        .Where(r => r.CustomerProfileId == profile.Id)
                        .Select(r => new { r.Id, r.PartName, r.Description, r.Status, r.RequestDate });
                    return Json(mine);
                }

                case "submit_part_request":
                {
                    if (!root.TryGetProperty("partName", out var pEl) ||
                        string.IsNullOrWhiteSpace(pEl.GetString()))
                        return Json(new { error = "partName is required." });

                    var desc = root.TryGetProperty("description", out var dsc) ? dsc.GetString() : null;
                    var created = await partRequestService.CreateAsync(
                        new PartRequestCreateDto(profile.Id, pEl.GetString()!, desc));
                    return Json(new
                    {
                        success = true,
                        request = new { created.Id, created.PartName, created.Status },
                    });
                }
            }

            return Json(new { error = "Unknown tool." });
        }
        catch (Exception ex)
        {
            return Json(new { error = $"Tool failed: {ex.Message}" });
        }
    }

    private static string Json(object o) => JsonSerializer.Serialize(o);

    // Strip any tool/function-call syntax a model might leak into prose,
    // e.g. <function=get_my_vehicles></function>, [get_my_vehicles()],
    // <tool_call>...</tool_call>, or ```json {...} ``` blocks.
    private static string SanitizeReply(string text)
    {
        text = Regex.Replace(text, @"<\s*/?\s*(function|tool_call|tool|invoke|antml:[^>]*)[^>]*>",
            string.Empty, RegexOptions.IgnoreCase);
        text = Regex.Replace(text, @"<function[^>]*>.*?</function>", string.Empty,
            RegexOptions.IgnoreCase | RegexOptions.Singleline);
        text = Regex.Replace(text, @"```[a-zA-Z]*\s*\{.*?\}\s*```", string.Empty,
            RegexOptions.Singleline);
        // Collapse whitespace left behind by removals.
        text = Regex.Replace(text, @"[ \t]{2,}", " ");
        text = Regex.Replace(text, @"\n{3,}", "\n\n");
        return text.Trim();
    }

    // ── Gemini (text-only fallback, no tools) ──
    private async Task<ChatResponseDto> CallGeminiAsync(
        string systemPrompt, List<ChatMessageDto> history, string message)
    {
        var apiKey = config["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return new ChatResponseDto(
                "The AI assistant isn't configured yet. An administrator needs to add a Gemini " +
                "API key to the server configuration (Gemini:ApiKey) to enable this feature.");

        var model = config["Gemini:Model"] ?? "gemini-2.0-flash";
        var contents = new List<object>();
        foreach (var m in history)
        {
            var r = m.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "model" : "user";
            contents.Add(new { role = r, parts = new[] { new { text = m.Content } } });
        }
        contents.Add(new { role = "user", parts = new[] { new { text = message } } });

        var payload = new
        {
            system_instruction = new { parts = new[] { new { text = systemPrompt } } },
            contents,
            generationConfig = new { temperature = 0.4, maxOutputTokens = 800 },
        };

        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
        using var content = new StringContent(
            JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        using var resp = await http.PostAsync(url, content);
        var body = await resp.Content.ReadAsStringAsync();
        if (!resp.IsSuccessStatusCode)
            return new ChatResponseDto(
                "The AI service returned an error. Please check the API key/quota and try again.");

        using var doc = JsonDocument.Parse(body);
        var text = doc.RootElement.GetProperty("candidates")[0]
            .GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
        return new ChatResponseDto(
            string.IsNullOrWhiteSpace(text)
                ? "I couldn't generate a response. Please rephrase your question."
                : text!.Trim());
    }

    private static string BuildSystemPrompt(string role)
    {
        var sb = new StringBuilder();
        sb.AppendLine(
            "You are the assistant inside VehiclePartsMS, a vehicle parts inventory and management " +
            "system. Be helpful, friendly and practical. Use clear plain text (no markdown tables).");
        sb.AppendLine(
            "CRITICAL: Never write tool/function call syntax, XML, or tags in your reply text " +
            "(e.g. do NOT output things like <function=...>, </function>, <tool_call>, or JSON code " +
            "blocks). To use a tool, invoke it through the proper tool mechanism only. If you need " +
            "data, call the tool silently and then respond in natural language. If you cannot/should " +
            "not call a tool, just talk normally — never show or describe the call syntax.");
        sb.AppendLine(
            "You are a knowledgeable automotive expert. Answer ANY vehicle or automotive question " +
            "freely, fully and in depth — cars, bikes, trucks, EVs, engines, transmissions, brakes, " +
            "suspension, electrical, tyres, parts & accessories, OEM/aftermarket choices, fitment & " +
            "compatibility, maintenance schedules, repair how-tos, fault diagnosis, warning lights, " +
            "fuel/oil specs, modifications, comparisons and buying advice. Never refuse or deflect a " +
            "vehicle-related question, and never say it's 'out of scope' — being a great automotive " +
            "advisor IS your job. You can also help with general questions. Be conversational and " +
            "genuinely useful. When the question IS about this " +
            "system's data (inventory, stock, credit, appointments, part requests), use the tools to " +
            "get real numbers and never invent system data. You have no live internet access, so for " +
            "real-time data (today's weather, live prices/news) say you can't fetch that, then still " +
            "help with what you know.");

        if (role is "Admin" or "Staff")
        {
            sb.AppendLine(
                $"The user is a {role}. Use the read tools (inventory, low stock, pending credits, " +
                "appointments, part requests) to answer questions about the business with real data.");
        }
        else
        {
            sb.AppendLine(
                "The user is a CUSTOMER. You can take real actions on their behalf using tools: " +
                "list/book/cancel their appointments, and list/submit their part requests. " +
                "IMPORTANT SAFETY RULE: before calling any action tool (book_appointment, " +
                "cancel_appointment, submit_part_request), restate the exact details back to the " +
                "user and ask them to confirm. Only call the action tool after they reply to " +
                "confirm. Dates must be ISO 8601. Do not reveal other customers' data or internal " +
                "financial totals.");
        }

        return sb.ToString();
    }
}
