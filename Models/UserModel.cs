using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;

namespace SprintRetrospective.Models
{
	public class UserModel
	{
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

		/* Public properties. */
		[JsonProperty("UserName")]
		[BsonElement("UserName")]
		public string UserName { get; private set; }

		[JsonProperty("FirstName")]
		[BsonElement("FirstName")]
		public string FirstName { get; private set; }

		[JsonProperty("LastName")]
		[BsonElement("LastName")]
		public string LastName { get; private set; }

		[JsonProperty("Email")]
		[BsonElement("Email")]
		public string Email { get; private set; }

		[JsonProperty("Password")]
		[BsonElement("Password")]
		public string Password { get; private set; }

		[JsonProperty("Projects")]
		[BsonElement("Projects")]
		public List<string> Projects { get; private set; } = new List<string>();

		/* Initialization. */
		public UserModel(string userName, string firstName, string lastName, string email, string password)
		{
			UserName = userName;
			FirstName = firstName;
			LastName = lastName;
			Email = email;
			Password = password;
		}
	}
}
