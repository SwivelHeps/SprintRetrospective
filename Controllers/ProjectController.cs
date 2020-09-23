
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SprintRetrospective.Models;
using SprintRetrospective.Services;

namespace SprintRetrospective.Controllers
{
	[Route("api/[controller]")]
	public class ProjectController : Controller
	{
		private readonly ProjectService _projectService;

		public ProjectController(ProjectService projectService)
		{
			_projectService = projectService;
		}
		/* End of ProjectController controller. */


		public IActionResult Index()
		{
			return View();
		}
		/* End of Index(). */


		[HttpGet("[action]")]
		public ActionResult<List<ProjectModel>> GetAllProjects()
		{
			return _projectService.GetAllProjects();
		}
		/* End of GetAllProjects(). */


		[HttpGet("[action]/{id}")]
		public ActionResult<ProjectModel> GetProjectByProjectId(string id)
		{
			return _projectService.GetByProjectId(id);
		}
		/* End of GetProjectByProjectId(). */


		[HttpPost]
		public ActionResult<ProjectModel> Post([FromBody]ProjectModel project)
		{
            return _projectService.Create(project);
		}
		/* End of Post(). */


		[HttpPost("[action]")]
		public ActionResult<ProjectModel> AddNewProject([FromBody] ProjectModel project)
		{
			 return _projectService.Create(new ProjectModel(project.CreationDate, project.OwnerUsername, project.ProjectName, project.Description, project.SprintConfig.StartDate, project.SprintConfig.EndDate));
		}


        [HttpPut("[action]/{id}")]
        public ActionResult<long>  UpdateProject(string id, [FromBody] ProjectModel project)
        {
            return _projectService.Update(id, project).ModifiedCount;
        }
	}
}