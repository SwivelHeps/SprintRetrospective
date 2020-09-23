
using MongoDB.Bson;
using Newtonsoft.Json;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace SprintRetrospective.Models
{
	public class SprintModel
	{
		[BsonElement("Description")]
		[JsonProperty("Description")]
		public string Description { get; set; }

		[BsonElement("CreatedBy")]
		[JsonProperty("CreatedBy")]
		public string CreatedBy { get; set; }

		[BsonElement("StoryPointWeight")]
		[JsonProperty("StoryPointWeight")]
		public int StoryPointWeight { get; set; } = 0;

		[BsonElement("IsActive")]
		[JsonProperty("IsActive")]
		public bool IsActive { get; set; } = false;

		[BsonElement("CreationDate")]
		[JsonProperty("CreationDate")]
		public string CreationDate { get; set; }

		[BsonElement("StartDate")]
		[JsonProperty("StartDate")]
		public string StartDate { get; set; } = "";

		[BsonElement("EndDate")]
		[JsonProperty("EndDate")]
		public string EndDate { get; set; } = "";

		[BsonElement("SprintHourDistribution")]
		[JsonProperty("SprintHourDistribution")]
		public Dictionary<string, int> SprintHourDistribution { get; set; } = new Dictionary<string, int>() {{ "proxy", 0 }};

		[BsonElement("TotalHours")]
		[JsonProperty("TotalHours")]
		public int TotalHours { get; set; } = 0;

		[BsonElement("StoryPointWeightByUser")]
		[JsonProperty("StoryPointWeightByUser")]
		public Dictionary<string, int> StoryPointWeightByUser { get; set; } = new Dictionary<string, int>() { { "proxy", 0 } };

		[BsonElement("PercentComplete")]
		[JsonProperty("PercentComplete")]
		public int PercentComplete { get; set; } = 0;

		[BsonElement("IsComplete")]
		[JsonProperty("IsComplete")]
		public bool IsComplete { get; set; } = false;

		[BsonElement("IsOverdue")]
		[JsonProperty("IsOverdue")]
		public bool IsOverdue { get; set; } = false;

		[BsonElement("IsRegistered")]
		[JsonProperty("IsRegistered")]
		public bool IsRegistered { get; set; } = false;
	}
	/* End of the SprintModel class. */
}