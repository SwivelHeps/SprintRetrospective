
using MongoDB.Bson;
using Newtonsoft.Json;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace SprintRetrospective.Models
{
	public class SprintHistoryModel
	{
		[BsonElement("StartDate")]
		[JsonProperty("StartDate")]
		public string StartDate { get; set; } = "";

		[BsonElement("EndDate")]
		[JsonProperty("EndDate")]
		public string EndDate { get; set; } = "";

		[BsonElement("SprintHourDistribution")]
		[JsonProperty("SprintHourDistribution")]
		public Dictionary<string, int> SprintHourDistribution { get; set; } = new Dictionary<string, int>() { { "proxy", 0 } };

		[BsonElement("TotalHours")]
		[JsonProperty("TotalHours")]
		public int TotalHours { get; set; } = 0;

		[BsonElement("StoriesComplete")]
		[JsonProperty("StoriesComplete")]
		public int StoriesComplete { get; set; } = 0;

		[BsonElement("StoriesOverdue")]
		[JsonProperty("StoriesOverdue")]
		public int StoriesOverdue { get; set; } = 0;

		[BsonElement("StoryPointPredicionAccuracy")]
		[JsonProperty("StoryPointPredicionAccuracy")]
		public Dictionary<string, int> StoryPointPredicionAccuracy { get; set; } = new Dictionary<string, int>() { { "proxy", 0 } };

		[BsonElement("Velocity")]
		[JsonProperty("Velocity")]
		public int Velocity { get; set; } = 0;

		[BsonElement("ParVelocity")]
		[JsonProperty("ParVelocity")]
		public int ParVelocity { get; set; } = 0;
	}
	/* End of SprintHistoryModel. */
}
