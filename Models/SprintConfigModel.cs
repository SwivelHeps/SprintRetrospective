
using MongoDB.Bson;
using Newtonsoft.Json;
using MongoDB.Bson.Serialization.Attributes;

namespace SprintRetrospective.Models
{
	public class SprintConfigModel
	{
		[BsonElement("StartDate")]
		[JsonProperty("StartDate")]
		public string StartDate { get; set; }

		[BsonElement("EndDate")]
		[JsonProperty("EndDate")]
		public string EndDate { get; set; }

		[BsonElement("HourQuotaPerMember")]
		[JsonProperty("HourQuotaPerMember")]
		public int HourQuotaPerMember { get; set; } = 3;

		[BsonElement("IterationInWeeks")]
		[JsonProperty("IterationInWeeks")]
		public int IterationInWeeks { get; set; } = 1;

		public SprintConfigModel(string sDate, string eDate)
		{
			StartDate = sDate;
			EndDate = eDate;
		}
		/* End of the SprintModel class. */
	}
}