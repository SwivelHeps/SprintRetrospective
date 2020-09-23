
/* File:        ProjectModel.cs
 * Author:		James Dumas
 * Purpose:     Project structure for this project. 
 * Date:        03-03-2019 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace SprintRetrospective.Models
{
    public class ProjectModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

		[BsonElement("CreationDate")]
		[JsonProperty("CreationDate")]
		public string CreationDate { get; set; }

		[JsonProperty("OwnerUsername")]
		[BsonElement("OwnerUsername")]
		public string OwnerUsername { get; set; }

		[JsonProperty("MemberUserNames")]
		[BsonElement("MemberUserNames")]
		public List<string> MemberUserNames { get; set; } = new List<string>();

		[JsonProperty("ProjectName")]
		[BsonElement("ProjectName")]
        public string ProjectName { get; set; }

		[JsonProperty("Description")]
		[BsonElement("Description")]
		public string Description { get; set; } = "No description was provided: Write a description!";

		[JsonProperty("SprintConfig")]
		[BsonElement("SprintConfig")]
		public SprintConfigModel SprintConfig { get; set; }

		[JsonProperty("SprintHistory")]
		[BsonElement("SprintHistory")]
		public List<SprintHistoryModel> SprintHistory { get; set; } = new List<SprintHistoryModel>();

		[JsonProperty("Backlog")]
		[BsonElement("Backlog")]
		public List<BacklogModel> Backlog { get; set; } = new List<BacklogModel>();

		[JsonProperty("Sprint")]
		[BsonElement("Sprint")]
		public List<SprintModel> Sprint { get; set; } = new List<SprintModel>();


		public ProjectModel(string date, string owner, string name, string description, string sDate, string eDate)
		{
			CreationDate = date;
			OwnerUsername = owner;
			ProjectName = name;
			Description = description;

			SprintConfig = new SprintConfigModel(sDate, eDate);

			SprintHistory.Add(new SprintHistoryModel());
			Backlog.Add(new BacklogModel());
			Sprint.Add(new SprintModel());
		}
		/* End of ProjectModel constructor. */
	}
    /* End of ProjectModel class. */
}