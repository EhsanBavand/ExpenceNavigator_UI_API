using ExpenseNavigator.Interfaces;
using ExpenseNavigator.Services;
using ExpenseNavigatorAPI.DAL;
using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Interfaces;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var isDev = builder.Environment.IsDevelopment();

#region 🔧 SERVICES

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IIncomeService, IncomeService>();
builder.Services.AddScoped<IIncomeSourceService, IncomeSourceService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ISubCategoryService, SubCategoryService>();
builder.Services.AddScoped<IPlaceService, PlaceService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ISavingService, SavingService>();
builder.Services.AddScoped<ITestEmailService, TestEmailService>();

#endregion

#region 🗄️ DATABASE

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

#endregion

#region 🔐 IDENTITY

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

#endregion

#region 🌐 CONTROLLERS + JSON

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

#endregion

#region 🌍 CORS (LOCAL + PRODUCTION SAFE)

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:54692",
            "https://localhost:54692",
            "https://www.maisonwebapp.com",
            "https://maisonwebapp.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

#endregion

#region 🔐 JWT AUTHENTICATION

var jwtKey = builder.Configuration["JWT:Secret"]
    ?? throw new Exception("JWT Secret is missing");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !isDev; // FIXED ✔

    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,

        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey))
    };
});

#endregion

#region 🔑 IDENTITY PASSWORD RULES

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    options.User.RequireUniqueEmail = true;
});

#endregion

#region ⏱ TOKEN SETTINGS

builder.Services.Configure<DataProtectionTokenProviderOptions>(opt =>
{
    opt.TokenLifespan = TimeSpan.FromMinutes(30);
});

#endregion

#region 📘 SWAGGER

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#endregion

var app = builder.Build();

#region 🚀 PIPELINE (IMPORTANT ORDER)

app.UseExceptionHandler("/error"); // must exist OR replace with inline handler

app.UseHttpsRedirection();

//// SWAGGER ONLY IN DEV AND PRODUCTION (NOT STAGING OR TESTING) - FIXED ✔
//if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#endregion

app.Run();