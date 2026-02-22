using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Models.Dashboard;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service)
    {
        _service = service;
    }

    [HttpGet("{userId}/{month:int}/{year:int}")]
    public async Task<IActionResult> GetAll(string userId, int month, int year)
    {
        var summary = await _service.GetMonthlySummaryAsync(userId, month, year);
        return Ok(summary);
    }

    [HttpGet("UserCategoryBudgets")]
    public async Task<IActionResult> GetUserCategoryBudgets(string userId, int month, int year)
    {
        var data = await _service.GetUserCategoryBudgetsAsync(userId, month, year);
        return Ok(data);
    }

    [HttpGet("GetSubCategoriesByCategory")]
    public async Task<IActionResult> GetSubCategoriesByCategory(string catId, string userId, int month, int year)
    {
        var data = await _service.GetSubCategoriesByCategory(catId, userId, month, year);
        return Ok(data);
    }

    // GET: /api/analytics/monthly?year=2026
    [HttpGet("GetMonthlySummery")]
    public async Task<ActionResult<List<MonthlySummaryDto>>> GetMonthlySummery(string userId, int year)
    {
        if (year <= 0) return BadRequest("Invalid year.");

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var data = await _service.GetMonthlySummaryAsync(userId, year);
        return Ok(data);
    }

}
