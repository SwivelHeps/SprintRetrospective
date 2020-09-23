
using System.Collections.Generic;
using System.Linq;
using SprintRetrospective.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;

namespace SprintRetrospective.Services
{
    public class UserService
    {
        private readonly IMongoCollection<UserModel> _users;

        public UserService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("SprintRetrospective"));
            var database = client.GetDatabase("sprint_retrospective");
            _users = database.GetCollection<UserModel>("users");
        }
		/* End of UserService constructor. */



		/* ///// Get Functions. ///// */
        public List<UserModel> GetAllUsers()
        {
            return _users.Find(user => true).ToList();
        }
		/* End of GetAllUsers(). */


        public UserModel GetById(string id)
        {
            return _users.Find<UserModel>(user => user.Id == id).FirstOrDefault();
        }
		/* End of GetById(). */


		public UserModel GetByUserName(string userName)
		{
			return _users.Find<UserModel>(user => user.UserName == userName).FirstOrDefault();
		}
		/* End of GetByUserName(). */



		/* ///// Post Functions. ///// */
		public UserModel Create(UserModel user)
        {
            _users.InsertOne(user);
            return user;
        }
		/* End of Create user. */



		/* ///// Put Functions. ///// */
		public ReplaceOneResult Update(string id, UserModel userIn)
        {
            userIn.Id = id;
            return _users.ReplaceOne(user => user.Id == id, userIn);
        }
		/* End of Update(). */



		/* ///// Delete Functions. ///// */
		public void Remove(UserModel userIn)
        {
            _users.DeleteOne(user => user.Id == userIn.Id);
        }
		/* End of Remove(). */


        public void Remove(string id)
        {
            _users.DeleteOne(user => user.Id == id);
        }
		/* End of Remove(). */
    }
}
