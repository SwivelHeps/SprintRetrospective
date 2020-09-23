using System.Collections.Generic;
using MongoDB.Bson;
using Newtonsoft.Json;
using MongoDB.Bson.Serialization.Attributes;

namespace SprintRetrospective.Models
{
	public class BacklogModel
	{
		[BsonElement("Description")]
		[JsonProperty("Description")]
		public string Description { get; set; }

		[BsonElement("CreatedBy")]
		[JsonProperty("CreatedBy")]
		public string CreatedBy { get; set; }

		[BsonElement("IsActive")]
		[JsonProperty("IsActive")]
		public bool IsActive { get; set; } = true;

		[BsonElement("StoryPointWeightByUser")]
		[JsonProperty("StoryPointWeightByUser")]
		public Dictionary<string, int> StoryPointWeightByUser { get; set; } = new Dictionary<string, int>() {{ "proxy", 0 }};

		[BsonElement("CreationDate")]
		[JsonProperty("CreationDate")]
		public string CreationDate { get; set; }
	}
}
