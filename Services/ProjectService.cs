
using System.Collections.Generic;
using System.Linq;
using SprintRetrospective.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;

namespace SprintRetrospective.Services
{
	public class ProjectService
	{
		private readonly IMongoCollection<ProjectModel> _projects;

		public ProjectService(IConfiguration config)
		{
			var client = new MongoClient(config.GetConnectionString("SprintRetrospective"));
			var database = client.GetDatabase("sprint_retrospective");
			_projects = database.GetCollection<ProjectModel>("projects");
		}
		/* End of UserService constructor. */



		/* ///// Get Functions. ///// */
		public List<ProjectModel> GetAllProjects()
		{
			return _projects.Find(project => true).ToList();
		}
		/* End of GetAllUsers(). */

		public ProjectModel GetByProjectId(string id)
		{
			return _projects.Find<ProjectModel>(project => project.Id == id).FirstOrDefault();
		}
		/* End of GetByUserName(). */



		/* ///// Post Functions. ///// */
		public ProjectModel Create(ProjectModel project)
		{
			_projects.InsertOne(project);
			return project;
		}
		/* End of Create user. */



		/* ///// Put Functions. ///// */
		public ReplaceOneResult Update(string id, ProjectModel projectIn)
		{
            projectIn.Id = id;
			return _projects.ReplaceOne(project => project.Id == id, projectIn);
		}
		/* End of Update(). */



		/* ///// Delete Functions. ///// */
		public void Remove(ProjectModel projectIn)
		{
			_projects.DeleteOne(project => project.Id == projectIn.Id);
		}
		/* End of Remove(). */


		public void Remove(string id)
		{
			_projects.DeleteOne(project => project.Id == id);
		}
		/* End of Remove(). */
	}
}
