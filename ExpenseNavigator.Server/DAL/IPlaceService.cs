using ExpenseNavigatorAPI.Models;
using System;
using System.Collections.Generic;

namespace ExpenseNavigatorAPI.Services
{
    public interface IPlaceService
    {
        IEnumerable<Place> GetAllPlaces(string userId);
        Place GetPlaceById(Guid id);
        Place AddPlace(PlaceDto place);
        Place UpdatePlace(PlaceDto place);
        bool DeletePlace(Guid id);

        // Returns places filtered by category or subcategory
        //IEnumerable<PlaceDropdownDto> GetPlacesForDropdown(Guid? categoryId = null, Guid? subCategoryId = null);
        IEnumerable<PlaceDropdownDto> GetPlacesForDropdown();
    }
}
