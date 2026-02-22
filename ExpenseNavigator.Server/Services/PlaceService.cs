using ExpenseNavigatorAPI.Data;
using ExpenseNavigatorAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ExpenseNavigatorAPI.Services
{
    public class PlaceService : IPlaceService
    {
        private readonly ApplicationDbContext _context;
        public PlaceService(ApplicationDbContext context)
        {
            _context = context;
        }
        public IEnumerable<Place> GetAllPlaces(string userId)
        {
            try
            {
                var places = _context.Places.Where(u => u.UserId == userId).ToList().OrderByDescending(p => p.IsActive).ThenBy(p => p.Name);
                return places;
            }
            catch (Exception ex)
            {
                // Log the error if you have logging
                throw new Exception("Failed to get all places.", ex);
            }
        }
        public Place GetPlaceById(Guid id)
        {
            try
            {
                //return _context.Places.Include(p => p.Category).Include(p => p.SubCategory).FirstOrDefault(p => p.Id == id);
                //var place = _context.Places.Include(p => p.Category).Where(p => p.IsActive && p.Category.IsActive).FirstOrDefault(p => p.Id == id);
                var place = _context.Places.Where(p => p.IsActive).FirstOrDefault(p => p.Id == id);

                if (place == null)
                    throw new KeyNotFoundException($"Place with Id {id} was not found.");

                return place;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to get place with Id {id}.", ex);
            }
        }
        public Place AddPlace(PlaceDto dto)
        {
            try
            {
                if (!_context.Users.Any(u => u.Id == dto.UserId))
                    throw new Exception($"User with Id {dto.UserId} does not exist.");

                //if (!_context.Categories.Any(c => c.Id == dto.CategoryId))
                //    throw new Exception($"Category with Id {dto.CategoryId} does not exist.");

                //if (dto.SubCategoryId.HasValue && !_context.SubCategories.Any(sc => sc.Id == dto.SubCategoryId.Value))
                //    throw new Exception($"SubCategory with Id {dto.SubCategoryId.Value} does not exist.");

                var place = new Place
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    UserId = dto.UserId,
                    //CategoryId = dto.CategoryId,
                    IsActive = true,
                    IsRecurring = dto.IsRecurring
                    //SubCategoryId = dto.SubCategoryId                    
                };

                _context.Places.Add(place);
                _context.SaveChanges();

                return place;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to add place.", ex);
            }
        }
        public Place UpdatePlace(PlaceDto dto)
        {
            try
            {
                var existing = _context.Places.Find(dto.Id);
                if (existing == null) return null;

                existing.Name = dto.Name;
                existing.UserId = dto.UserId;
                existing.IsActive = dto.IsActive;
                existing.IsRecurring = dto.IsRecurring;
                //existing.SubCategoryId = dto.SubCategoryId;

                _context.SaveChanges();
                return existing;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to update place with Id {dto.Id}.", ex);
            }
        }
        public bool DeletePlace(Guid id)
        {
            try
            {
                var place = _context.Places.Find(id);
                if (place == null) return false;
                place.IsActive = false;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete place with Id {id}.", ex);
            }
        }
        public IEnumerable<PlaceDropdownDto> GetPlacesForDropdown()
        {
            try
            {
                var places = _context.Places
                    .Where(p => p.IsActive)
                    .ToList(); // you can put a breakpoint here

                var result = places.Select(p => new PlaceDropdownDto
                {
                    Id = p.Id,
                    Name = p.Name
                }).ToList(); // you can put a breakpoint here too

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to get places for dropdown.", ex);
            }
        }


        //public IEnumerable<PlaceDropdownDto> GetPlacesForDropdown(Guid? categoryId = null, Guid? subCategoryId = null)
        //{
        //    try
        //    {
        //        var query = _context.Places.Where(p => p.IsActive).AsQueryable();

        //        if (categoryId.HasValue)
        //            query = query.Where(p => p.CategoryId == categoryId);

        //        //if (subCategoryId.HasValue)
        //        //    query = query.Where(p => p.SubCategoryId == subCategoryId);

        //        return query.Select(p => new PlaceDropdownDto
        //        {
        //            Id = p.Id,
        //            Name = p.Name
        //        }).ToList();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception("Failed to get places for dropdown.", ex);
        //    }
        //}
    }
}
