
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SprintRetrospective.Models;
using SprintRetrospective.Services;

namespace SprintRetrospective.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }
		/* End of UserController controller. */


        public IActionResult Index()
        {
            return View();
        }
		/* End of Index(). */


        [HttpGet("[action]")]
        public ActionResult<List<UserModel>> GetAllUsers()
        {
             return _userService.GetAllUsers();
        }
		/* End of GetAllUsers(). */


		[HttpGet("[action]/{userName}")]
		public ActionResult<UserModel> GetUserByUserName(string userName)
		{
			return _userService.GetByUserName(userName);
		}
		/* End of GetUserByName(). */


		[HttpPost]
        public ActionResult<UserModel> Post(UserModel user)
        {
            return _userService.Create(user);
        }
		/* End of Post(). */


		[HttpPost("[action]")]
		public ActionResult<UserModel> AddNewUser([FromBody] UserModel user)
		{
			return _userService.Create(new UserModel(user.UserName, user.FirstName, user.LastName, user.Email, user.Password));
		}

        [HttpPut("[action]/{id}")]
        public ActionResult<long> UpdateUser(string id, [FromBody] UserModel user)
        {
            return _userService.Update(id, user).ModifiedCount;
        }
    }
}