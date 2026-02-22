using ExpenseNavigatorAPI.Models;
using ExpenseNavigatorAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ExpenseNavigatorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaceController : ControllerBase
    {
        private readonly IPlaceService _service;

        public PlaceController(IPlaceService service)
        {
            _service = service;
        }
        
        [HttpGet] 
        public IActionResult GetAllPlaces([FromQuery] string userId)
        {
            var places = _service.GetAllPlaces(userId);
            return Ok(places);
        }


        [HttpGet("{id}")]
        public IActionResult GetPlaceById(Guid id)
        {
            var place = _service.GetPlaceById(id);
            if (place == null) return NotFound();
            return Ok(place);
        }

        [HttpPost]
        public IActionResult AddPlace([FromBody] PlaceDto place)
        {
            var result = _service.AddPlace(place);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult UpdatePlace(Guid id, [FromBody] PlaceDto place)
        {
            place.Id = id;
            var result = _service.UpdatePlace(place);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult DeletePlace(Guid id)
        {
            var result = _service.DeletePlace(id);
            if (!result) return NotFound();
            return Ok();
        }

        [HttpGet("placesdropdown")]
        public IActionResult GetPlacesForDropdown([FromQuery] Guid? categoryId, [FromQuery] Guid? subCategoryId)
        {
            var result = _service.GetPlacesForDropdown();
            return Ok(result);
        }
    }
}
