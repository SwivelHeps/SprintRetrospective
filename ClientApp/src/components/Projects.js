
/* Authors:		James Duams, Wilber Castaneda, Joel Blais
 * Purpose:		This is the main component within this project.
 */

import React, { Component } from "react";
import "./style/projects.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar'

export class Projects extends Component {

	displayName = Projects.name;

	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* /////////////////////////////////////////// Initialization ///////////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	constructor(props) {

		super(props);

		this.state = {
			userData: this.props.userData,
			selectedProject: undefined,

			/* //// Project Related ///// */
			allProjects: [],

			isCreatingProject: false,
			newProjectName: "",
			newProjectDescription: "",

			isAddingUser: false,
			newUserName: "",

			/* jsx elements for display. */
			projectDetails: [],
			projectNames: [],
			members: [],


			/* //// Sprint Related ///// */
			sprintOver: false,

			sprintLengthWeeks: 0,
			fibonacchiScale: [0, 1, 2, 3, 5, 8],
			selectedScaleValue: 0,

			/* config. */
			iterationLengthWeekOptions: [1, 2, 3, 4, 5],
			hourExpectationsPerMember: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			selectedSprintIterationLength: 0,
			selectedSprintHoursExpected: 0,

			/* jsx elements for display. */
			sprintStories: [],
			isConfiguringSprint: false,
			isViewingHistoryReport: false,
			sprintHistoryStories: [],


			/* //// Backlog Related ///// */
			backlogStories: [],


			/* //// Story Related ///// */
			isCreatingStory: false,
			newStoryDescription: "",

			/* //// Completed Stories ///// */
			completedStories: [],

			/* ///// Report. ///// */
			isReportShowing: false
		}
	}


	componentDidMount = async () => {
		await this.getUserProjects();
	}
	/* End of componentDidMount(). */



	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ////////////////////////////////////////// Utility Functions /////////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	calculateSprintWeightAverage = async (description) => {

		const { selectedProject } = this.state;
		let allBacklogStories = selectedProject.Backlog;

		/* Capture the total hour contributions per member. */
		let totalHours = 0;
		let count = 0;

		allBacklogStories.map((story) => {

			if (story.Description === description) {
				for (var contribution in story.StoryPointWeightByUser) {
					totalHours += story.StoryPointWeightByUser[contribution];
					++count;
				}
			}
		})

		return Math.ceil(totalHours / count);
	}
	/* End of calculateSprintWeightAverage(). */


	calculateTotalSprintWeightAverage = async () => {
		const { Backlog } = this.state.selectedProject;

		let count = 0, total = 0;
		Backlog.map((story) => {

			++count;

			Object.values(story.StoryPointWeightByUser).map((weightEstimate) => {
				total += weightEstimate;
				return total;
			})

			return total;
		})

		return total / (count - 1);
	}
	/* End of calculateTotalSprintWeightAverage(). */


	/* Function to load select of options based on the contents of an array. */
	loadSelectOptions(filteredContent) {
		return Object.keys(filteredContent).map((eachContentItem) => {
			return <option key={filteredContent[eachContentItem]} value={filteredContent[eachContentItem]}>{filteredContent[eachContentItem]}</option>
		})
	}
	/* End of loadSelectOptions(). */


	refresh = async () => {
		await this.loadProjectDetails();
		await this.loadMembersList();

		this.renderBacklog();
		this.renderSprint();
		this.renderSprintHistory();
		this.renderCompletedStories();
	}
	/* End of refresh(). */



	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ////////////////////////////////////// Project Crud Operations ///////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	createNewProject = async () => {
		const { userData, newProjectName, newProjectDescription } = this.state;

		/* Find the creation date and then offset it to the following Sunday. */
		let createDate = await moment().format("LLLL");

		let startDate = moment().format("LLLL");

		/* Configuration to set the initial start date to the next upcoming Sunday. */
		//let startDayNum = await moment().weekday();

		//if (startDayNum < 7) {
		//	startDate = await moment().add(7 - startDayNum, 'days').format("LLLL");
		//}

		let endDate = await moment(startDate).add(1, 'minutes').format("LLLL");

		/* Push the new project up to the database. */
		let potentialProjectData = await fetch('api/Project/AddNewProject', {
			credentials: 'same-origin',
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json '
			},
			body: JSON.stringify({
				CreationDate: createDate,
				OwnerUsername: userData.UserName,
				ProjectName: newProjectName,
				Description: newProjectDescription,
				SprintConfig: {
					StartDate: startDate,
					EndDate: endDate
				}
			})
		})
		.then(data => {
			return data.json();
		})
		.catch((error) => {
			console.error(error);
		})

		/* Return the data and determine if the their has been a new addition. 
		 * Then add it to the user and update them on mongoDb. */
		let projects = userData.Projects;
		projects.push(potentialProjectData.id);

		/* Push the new project up to the database. */
		await fetch('api/User/UpdateUser/' + userData.id, {
			credentials: 'same-origin',
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json '
			},
			body: JSON.stringify({
				UserName: userData.UserName,
				FirstName: userData.FirstName,
				LastName: userData.LastName,
				Email: userData.Email,
				Password: userData.Password,
				Projects: projects
			})
		})
		.then(data => {
			return data.json();
		})
		.catch((error) => {
			console.error(error);
		})

		return projects;
	}
	/* End of createNewProject(). */


	getUserProjects = async () => {
		const { userData } = this.state;

		/* Projects are available and must be have the projects captured for rendering of names. */
		let projectData = await Promise.all(userData.Projects.map(async (project) => {

			let result = await fetch('api/Project/GetProjectByProjectId/' + project);
			let json = await result.json();

			return json;
		}));

		this.setState({
			allProjects: projectData
		})

		await this.loadProjectList();
	}
	/* End of getUserProjects(). */


	updateProject = async () => {
		const { selectedProject } = this.state;

		/* Push the new project up to the database. */
		let updatedProjectCount = await fetch('api/Project/UpdateProject/' + selectedProject.id, {
			credentials: 'same-origin',
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json '
			},
			body: JSON.stringify({
				CreationDate: selectedProject.CreationDate,
				OwnerUsername: selectedProject.OwnerUsername,
				MemberUserNames: selectedProject.MemberUserNames,
				ProjectName: selectedProject.ProjectName,
				Description: selectedProject.Description,
				SprintConfig: selectedProject.SprintConfig,
				SprintHistory: selectedProject.SprintHistory,
				Backlog: selectedProject.Backlog,
				Sprint: selectedProject.Sprint
			})
		}).then(data => {
			return data.json();
		})
			.catch((error) => {
				console.error(error);
			})

		this.refresh();

		/* Log the update results. */
		console.log(updatedProjectCount);
	}
	/* End of updateProject(). */



	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ////////////////////////////////////// OnChange Update Handlers //////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	registerProjectNameChange = (event) => {
		this.setState({ newProjectName: event.target.value });
	}
	/* End of registerProjectNameChange(). */


	registerProjectDescriptionChange = (event) => {
		this.setState({ newProjectDescription: event.target.value });
	}
	/* End of registerProjectDescriptionChange(). */


	registerUserNameChange = (event) => {
		this.setState({ newUserName: event.target.value });
	}
	/* End of registerUserNameChange(). */


	registerStoryDescriptionChange = (event) => {
		this.setState({ newStoryDescription: event.target.value });
	}
	/* End of registerStoryDescriptionChange(). */



	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ///////////////////////////////////////// OnClick Handlers ///////////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	projectSelection = async (projectName) => {
		let selected = this.state.allProjects.filter((project) => project.ProjectName === projectName);

		await this.setState({
			selectedProject: selected[0],

			/* //// Project Related ///// */
			isCreatingProject: false,
			newProjectName: "",
			newProjectDescription: "",

			isAddingUser: false,
			newUserName: "",

			/* jsx elements for display. */
			projectDetails: [],
			members: [],

			/* //// Sprint Related ///// */
			sprintOver: false,

			sprintLengthWeeks: 0,
			selectedScaleValue: 0,

			/* config. */
			selectedSprintIterationLength: 0,
			selectedSprintHoursExpected: 0,

			/* jsx elements for display. */
			sprintStories: [],
			isConfiguringSprint: false,
			isViewingHistoryReport: false,
			sprintHistoryStories: [],

			/* //// Backlog Related ///// */
			backlogStories: [],

			/* //// Story Related ///// */
			isCreatingStory: false,
			newStoryDescription: "",

			/* //// Completed Stories ///// */
			completedStories: [],

			/* ///// Report. ///// */
			isReportShowing: false
		});

		this.checkSprintEnd();
		this.refresh();
	}
	/* End of projectSelection() */


	/* ///// Project Creation ///// */
	startCreateProject = () => {
		this.setState({
			isCreatingProject: true
		})
	};
	/* End of startCreateProject(). */


	confirmCreateProject = async () => {
		const { userData } = this.state;

		let projects = await this.createNewProject();

		this.setState({
			isCreatingProject: false,
			newProjectName: "",
			newProjectDescription: "",
			userData: {
				UserName: userData.UserName,
				FirstName: userData.FirstName,
				LastName: userData.LastName,
				Email: userData.Email,
				Password: userData.Password,
				Projects: projects
			}
		})

		/* Refresh the project list. */
		this.getUserProjects();
	};
	/* End of confirmCreateProject(). */


	cancelCreateProject = () => {
		this.setState({
			isCreatingProject: false,
			newProjectName: "",
			newProjectDescription: "",
		})
	};
	/* End of cancelCreateProject(). */


	/* ///// User Addition ///// */
	startAddUserToProject = () => {
		this.setState({
			isAddingUser: true
		})
	};
	/* End of startCreateProject(). */


	confirmAddUserToProject = async () => {
		const { newUserName, selectedProject } = this.state;

		let theUsers = selectedProject.MemberUserNames;

		let potentialUserData = await fetch('api/User/GetUserByUserName/' + newUserName)
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error(error);
			})

		if (potentialUserData !== undefined) {

			theUsers.push(potentialUserData.UserName);

			potentialUserData.Projects.push(selectedProject.id);

			/* Update the user adding the project id to their list. */
			let resultSuccess = await fetch('api/User/UpdateUser/' + potentialUserData.id, {
				credentials: 'same-origin',
				method: 'PUT',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json '
				},
				body: JSON.stringify({
					UserName: potentialUserData.UserName,
					FirstName: potentialUserData.FirstName,
					LastName: potentialUserData.LastName,
					Email: potentialUserData.Email,
					Password: potentialUserData.Password,
					Projects: potentialUserData.Projects
				})
			}).then(data => {
				return data.json();
			})
				.catch((error) => {
					console.error(error);
				})

			if (resultSuccess !== 0) {
				this.setState({
					members: theUsers,
					newUserName: "",
					isAddingUser: false
				});

				this.updateProject();
				this.loadMembersList();
			}
		}
	};
	/* End of confirmAddUserToProject(). */


	cancelAddUserToProject = () => {
		this.setState({
			isAddingUser: false,
			newUserName: ""
		})
	};
	/* End of cancelCreateUser(). */


	/* ///// Sprint Config ///// */
	startSprintConfig = () => {
		this.setState({
			isConfiguringSprint: true
		})
	};
	/* End of startSprintConfig(). */


	confirmSprintConfig = async () => {
		const { userData } = this.state;

		this.setState({
			isConfiguringSprint: false
		})
	};
	/* End of confirmSprintConfig(). */


	cancelSprintConfig = () => {
		this.setState({
			isConfiguringSprint: false
		})
	};
	/* End of cancelCreateProject(). */


	setStoryPointScale = (event) => {
		this.setState({
			selectedScaleValue: event.target.value
		});
	}
	/* End of setStoryPointScale(). */


	contributeHours = async (event, description) => {
		//const { Sprint } = this.state.selectedProject;
		//const { selectedProject, userData } = this.state;

		//let proxyProject = selectedProject;

		//let theSprint = Sprint.map((story) => {
		//	if (story.Description === description) {
		//		if (story.hasOwnProperty(userData.UserName)) {
		//			story.SprintHourDistribution[userData.UserName] += parseInt(event.target.value);
		//		}
		//		else {
		//			story.SprintHourDistribution[userData.UserName] = parseInt(event.target.value);
		//		}
		//	}

		//	return story;
		//});

		//proxyProject["Sprint"] = theSprint;

		//await this.setState({
		//	selectedProject: proxyProject
		//})

		//await this.updateProject();
	}
	/* End of contributeHours() */


	updateStoryPointOpinionOverdue = async (event, description) => {

		const { Sprint } = this.state.selectedProject;
		const { selectedProject, userData } = this.state;

		let proxyProject = selectedProject;

		let theSprint = Sprint.map((story) => {
			if (story.Description === description) {

				let oldWeight = story.StoryPointWeightByUser[userData.UserName];
				let completion = Math.floor((oldWeight - event.target.value) / oldWeight * 100);

				story.StoryPointWeightByUser[userData.UserName] = event.target.value;
				story["PercentComplete"] = completion;
			}

			return story;
		});

		proxyProject["Sprint"] = theSprint;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of updateStoryPointOpinion() */


	updateStoryPointOpinion = async (event, description) => {
		const { Backlog, Sprint } = this.state.selectedProject;
		const { selectedProject, userData } = this.state;

		let proxyProject = selectedProject;

		let theBacklog = Backlog.map((story) => {
			if (story.Description === description) {
				story.StoryPointWeightByUser[userData.UserName] = event.target.value;
			}

			return story;
		});


		let theSprint = Sprint.map((story) => {
			if (story.Description === description) {
				story.StoryPointWeightByUser[userData.UserName] = event.target.value;
			}

			return story;
		});

		proxyProject["Backlog"] = theBacklog;
		proxyProject["Sprint"] = theSprint;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of updateStoryPointOpinion() */


	updateIterationLengthChange = (event) => {
		this.setState({
			selectedSprintIterationLength: event.target.value
		});
	}
	/* End of updateIterationLengthChange(). */


	/* ///// New Story ///// */
	startCreateStory = () => {
		this.setState({
			isCreatingStory: true
		})
	};
	/* End of startCreateStory(). */


	confirmCreateStory = async () => {
		const { userData, selectedProject, newStoryDescription, selectedScaleValue } = this.state;

		/* Capture relavent information and then add both the backlog and sprint at the same time. Which
		 * one is visible is determined by the IsActive attribute. */
		let proxyProject = selectedProject;
		let allBacklogStories = selectedProject.Backlog;
		let allSprintStories = selectedProject.Sprint;

		allBacklogStories.push({ Description: newStoryDescription, CreatedBy: userData.UserName, IsActive: true, StoryPointWeightByUser: { [userData.UserName]: selectedScaleValue }, CreationDate: moment().format("LLLL") });
		allSprintStories.push({ Description: newStoryDescription, CreatedBy: userData.UserName, IsActive: false, StoryPointWeightByUser: { [userData.UserName]: selectedScaleValue }, CreationDate: moment().format("LLLL") });

		proxyProject["Backlog"] = allBacklogStories;
		proxyProject["Sprint"] = allSprintStories;

		await this.setState({
			selectedProject: proxyProject,
			newStoryDescription: "",
			isCreatingStory: false
		})

		this.updateProject();
	};
	/* End of confirmCreateStory(). */


	cancelCreateStory = () => {
		this.setState({
			isCreatingStory: false,
			newStoryDescription: ""
		})
	};
	/* End of cancelCreateStory(). */


	moveToBacklog = async (event) => {
		const { Backlog, Sprint } = this.state.selectedProject;
		const { selectedProject } = this.state;

		let proxyProject = selectedProject;

		let theBacklog = Backlog.map((story) => {
			if (story.Description === event) {
				story["IsActive"] = true;
			}

			return story;
		});

		let theSprints = Sprint.map((story) => {
			if (story.Description === event) {
				story["IsActive"] = false;
			}

			return story;
		});


		proxyProject["Backlog"] = theBacklog;
		proxyProject["Sprint"] = theSprints;

		console.log(proxyProject);

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of moveToBacklog(). */


	moveToSprint = async (event) => {
		const { Backlog, Sprint } = this.state.selectedProject;
		const { selectedProject } = this.state;

		let proxyProject = selectedProject;

		let descriptionHold;

		let theBacklog = await Backlog.map((story) => {
			if (story.Description === event) {
				descriptionHold = event;
				story["IsActive"] = false;
			}

			return story;
		});

		let avg = await this.calculateSprintWeightAverage(descriptionHold);

		let theSprints = Sprint.map((story) => {

			if (story.Description === event) {
				story["IsActive"] = true;
				story["StartDate"] = "";
				story["StoryPointWeight"] = avg;
			}


			return story;
		});

		proxyProject["Backlog"] = theBacklog;
		proxyProject["Sprint"] = theSprints;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of moveToSprint(). */


	checkSprintEnd = async () => {

		const { SprintConfig } = this.state.selectedProject;

		let endStamp = await moment(SprintConfig.EndDate);
		let test = await moment();

		let isSprintOver = test.isAfter(endStamp);

		if (isSprintOver) {
			this.registerSprint();
		}
	}
	/* End of checkSprintEnd(). */


	showHistoricalReport = async () => {
		this.setState({
			isReportShowing: true
		})
	}
	/* End of showHistoricalReport(). */


	closeHistoricalReport = async () => {
		this.setState({
			isReportShowing: false
		})
	}
	/* End of closeHistoricalReport(). */


	registerSprint = async () => {
		const { selectedProject } = this.state;
		let sprintConfig = selectedProject.SprintConfig;
		let sprintHistory = selectedProject.SprintHistory;
		let proxyProject = selectedProject;
		let allSprintStories = selectedProject.Sprint;

		/* Capture the total hour contributions per member. */
		let allSprintHourContributions = {};
		let totalHours = 0;

		allSprintStories.map((story) => {

			for (var contribution in story.SprintHourDistribution) {

				if (story.IsComplete && !story.IsRegistered) {
					if (allSprintHourContributions.hasOwnProperty(contribution)) {
						allSprintHourContributions[contribution] += story.SprintHourDistribution[contribution];
						totalHours += story.SprintHourDistribution[contribution];
					}
					else {
						allSprintHourContributions[contribution] = story.SprintHourDistribution[contribution];
						totalHours += story.SprintHourDistribution[contribution];
					}
				}
			}
		})

		/* Capture relavent information and then add both the backlog and sprint at the same time. Which
		 * one is visible is determined by the IsActive attribute. */

		let velocity = 0;
		let storiesCompleted = 0;
		let storiesOverdue = 0;
		let theSprints = allSprintStories.map((story) => {

			/* Capture the total hours invested into this sprint. */
			let thisSprintHours = 0;

			for (var contribution in story.SprintHourDistribution) {

				if (story.IsComplete && !story.IsRegistered) {
					if (allSprintHourContributions.hasOwnProperty(contribution)) {
						thisSprintHours += story.SprintHourDistribution[contribution];
					}
					else {
						thisSprintHours += story.SprintHourDistribution[contribution];
					}
				}


			}

			/* Reconfigure the way the sprint is displayed. */
			if (story.IsComplete && !story.IsRegistered) {
				story["IsRegistered"] = true;
				story["TotalHours"] = thisSprintHours;
				velocity += story.StoryPointWeight;
				storiesCompleted++;
			}

			if (!story.IsComplete && story.StartDate !== "") {
				story["IsOverdue"] = true;
				story["TotalHours"] = thisSprintHours;
				storiesOverdue++;
			}

			return story;
		})

		let potentialVelocity = sprintConfig.HourQuotaPerMember * (selectedProject.MemberUserNames.length + 1);

		/* The relavent and calculated data for this sprint interval. */
		let theSprintData = {
			StartDate: sprintConfig.StartDate,
			EndDate: sprintConfig.EndDate,
			SprintHourDistribution: allSprintHourContributions,
			TotalHours: totalHours,
			StoriesComplete: storiesCompleted,
			StoriesOverdue: storiesOverdue,
			Velocity: velocity,
			ParVelocity: potentialVelocity
		}

		sprintHistory.push(theSprintData);

		let startDate = moment().format("LLLL");
		let endDate = await moment(startDate).add(sprintConfig.IterationInWeeks, 'minutes').format("LLLL");

		sprintConfig["StartDate"] = startDate;
		sprintConfig["EndDate"] = endDate;

		proxyProject["SprintHistory"] = sprintHistory;
		proxyProject["SprintConfig"] = sprintConfig;
		proxyProject["Sprint"] = theSprints;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of registerSprint(). */


	startStory = async (description) => {
		const { Sprint } = this.state.selectedProject;
		const { selectedProject } = this.state;

		let proxyProject = selectedProject;

		let theSprints = Sprint.map((story) => {
			if (story.Description === description) {
				story["StartDate"] = moment().format("LLLL");
			}

			return story;
		});

		proxyProject["Sprint"] = theSprints;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of startStory(). */


	completeStory = async (description) => {
		const { Sprint } = this.state.selectedProject;
		const { selectedProject } = this.state;

		let proxyProject = selectedProject;

		let theSprints = Sprint.map((story) => {
			if (story.Description === description) {
				story["IsActive"] = false;
				story["EndDate"] = moment().format("LLLL");
				story["IsComplete"] = true;
			}

			return story;
		});

		proxyProject["Sprint"] = theSprints;

		await this.setState({
			selectedProject: proxyProject
		})

		this.updateProject();
	}
	/* End of completeStory(). */


	updateHoursExpectedChange = async (event) => {

		let proxyProject = this.state.selectedProject;

		proxyProject.SprintConfig["HourQuotaPerMember"] = event.target.value;

		await this.setState({
			selectedProject: proxyProject,
			selectedSprintHoursExpected: event.target.value
		})

		console.log(proxyProject);

		this.updateProject();
	}
	/* End of updateHoursExpectedChange(). */


	updateIterationLengthChange = async (event) => {
		let proxyProject = this.state.selectedProject;

		proxyProject.SprintConfig["IterationInWeeks"] = event.target.value;

		await this.setState({
			selectedProject: proxyProject,
			selectedSprintIterationLength: event.target.value
		})

		console.log(proxyProject);

		this.updateProject();
	}
	/* End of updateIterationLengthChange(). */


	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ///////////////////////////////////////// JSX Construction ///////////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	loadProjectList = () => {
		const { allProjects } = this.state;

		let projects = allProjects.map((project) => <li key={project.id} onClick={() => this.projectSelection(project.ProjectName)}>{project.ProjectName}</li>);

		this.setState({
			projectNames: projects
		})
	}
	/* End of loadProjectList(). */


	loadProjectDetails = () => {
		const { selectedProject } = this.state;

		let projectDetails = (
			<div>
				<ul className="bubble">
					<li>
						<div className="flex-ul-row">
							<label>Project Name: </label><span>{selectedProject.ProjectName}</span>
						</div>
					</li>
					<li>
						<div className="flex-ul-row">
							<label>Owner: </label><span>{selectedProject.OwnerUsername}</span>
						</div>
					</li>
					<li>
						<div className="flex-ul-row">
							<label>Created On: </label><span>{selectedProject.CreationDate}</span>
						</div>
					</li>
					<li>
						<div className="flex-ul-row">
							<label>Description: </label><span>{selectedProject.Description}</span>
						</div>
					</li>
					<li>
						<div className="flex-ul-row">
							<label>Members: </label><span>{(selectedProject.MemberUserNames.length + 1)}</span>
						</div>
					</li>
					<li>
						<div className="flex-ul-row">
							<label>Stories: </label><span>{(selectedProject.Sprint.length + selectedProject.Backlog.length - 2)}</span>
						</div>
					</li>	
				</ul>
			</div>
		)

		this.setState({
			projectDetails: projectDetails
		});
	}
	/* End of loadProjectDetails(). */


	loadMembersList = () => {
		const { selectedProject } = this.state;

		let members = Object.values(selectedProject.MemberUserNames).map((member) => <li key={member}>{member}</li>)
		members.unshift(<li>{selectedProject.OwnerUsername}</li>);

		this.setState({
			members: members
		})
	}
	/* End of loadMembersList(). */


	renderBacklog = () => {
		if (this.state.selectedProject) {

			const { Backlog } = this.state.selectedProject;
			const { fibonacchiScale, userData } = this.state;

			let fibAsOptions = this.loadSelectOptions(fibonacchiScale);

			let projectDetails = Backlog.map((story) => {
				if (story.CreatedBy !== null) {
					return (
						(story.IsActive && (
							<div className="bubble log-row" style={{ margin: '5px 0 5px 0' }}>
								<ul>
									<li key={story.CreatedBy}>
										<div className="inner-log-row-left">
											<label>Creator: </label><span>{story.CreatedBy}</span>
										</div>
									</li>
									<li key={story.CreationDate}>
										<div className="inner-log-row-left">
											<label>Created On: </label><span>{story.CreationDate}</span>
										</div>
									</li>
									<li key={story.Description}>
										<div className="inner-log-row-left">
											<label>Description: </label><span>{story.Description}</span>
										</div>
									</li>
									<li key={story.Description}>
										<div className="inner-log-row-left">
											<label>Current Weight: </label><span>{story.StoryPointWeightByUser[userData.UserName]}</span>
										</div>
									</li>
									<li>
										<div className="inner-log-row-left">
											<label>Update Weight:</label>
											<select style={{ height: '20px',background: '#DEF2F1' }}  onChange={(event) => this.updateStoryPointOpinion(event, story.Description)}>{fibAsOptions}</select>
										</div>
									</li>
								</ul>
								<button value={story.Description} onClick={() => this.moveToSprint(story.Description)} className="btn btn-success common-button square-button">{<FontAwesomeIcon icon="angle-double-right" />}</button>
							</div>
						))
					)
				}
			});

			this.setState({
				backlogStories: projectDetails
			})
		}
	}
	/* End of renderBacklog() . */


	renderSprintHistory = () => {
		if (this.state.selectedProject) {

			const { SprintHistory } = this.state.selectedProject;

			let historicalSprintStories = SprintHistory.map((sprint) => {
				if (sprint.StartDate !== "") {

					return (
						<div className="bubble log-row" style={{ margin: '5px 0 5px 0' }}>
							<ul>
								<li key={sprint.StartDate}>
									<div className="inner-log-row-left">
										<label>Started On: </label><span>{sprint.StartDate}</span>
									</div>
								</li>
								<li key={sprint.EndDate}>
									<div className="inner-log-row-left">
										<label>Completed On: </label><span>{sprint.EndDate}</span>
									</div>
								</li>
								<li key={sprint.StoriesComplete}>
									<div className="inner-log-row-left">
										<label>Stories Complete: </label><span>{sprint.StoriesComplete}</span>
									</div>
								</li>
								<li key={sprint.StoriesOverdue}>
									<div className="inner-log-row-left">
										<label>Stories Overdue: </label><span>{sprint.StoriesOverdue}</span>
									</div>
								</li>
								<li key={sprint.TotalHours}>
									<div className="inner-log-row-left">
										<label>Total Hours: </label><span>{sprint.TotalHours}</span>
									</div>
								</li>
								<li key={sprint.Velocity}>
									<div className="inner-log-row-left">
										<label>Velocity: </label><span>{sprint.Velocity}</span>
									</div>
								</li>
								<li key={sprint.ParVelocity}>
									<div className="inner-log-row-left">
										<label>Desired Velocity: </label><span>{sprint.ParVelocity}</span>
									</div>
								</li>
							</ul>
						</div>
					)
				}
			});

			this.setState({
				sprintHistoryStories: historicalSprintStories
			})
		}
	}
	/* End of renderSprintHistory(). */


	renderCompletedStories = () => {
		if (this.state.selectedProject) {

			const { Sprint } = this.state.selectedProject;

			let completedStories = Sprint.map((story) => {
				if (story.CreatedBy !== null) {

					return (
						(story.IsComplete && (
							<div className="bubble log-row" style={{ margin: '5px 0 5px 0' }}>
								<ul>
									<li key={story.CreatedBy}>
										<div className="inner-log-row-left">
											<label>Creator: </label><span>{story.CreatedBy}</span>
										</div>
									</li>
									<li key={story.CreationDate}>
										<div className="inner-log-row-left">
											<label>Created On: </label><span>{story.CreationDate}</span>
										</div>
									</li>
									<li key={story.StartDate}>
										<div className="inner-log-row-left">
											<label>Started On: </label><span>{story.StartDate}</span>
										</div>
									</li>
									<li key={story.EndDate}>
										<div className="inner-log-row-left">
											<label>Completed On: </label><span>{story.EndDate}</span>
										</div>
									</li>
									<li key={story.TotalHours}>
										<div className="inner-log-row-left">
											<label>Total Hours: </label><span>{story.TotalHours}</span>
										</div>
									</li>
									<li key={story.Description}>
										<div className="inner-log-row-left">
											<label>Description: </label><span>{story.Description}</span>
										</div>
									</li>
									<li key={story.StoryPointWeight}>
										<div className="inner-log-row-left">
											<label>Avg. Weight: </label><span>{story.StoryPointWeight}</span>
										</div>
									</li>
								</ul>
							</div>
						))
					)
				}
			});

			this.setState({
				completedStories: completedStories
			})
		}
	}
	/* End of renderSprint(). */


	renderSprint = () => {
		if (this.state.selectedProject) {

			const { Sprint } = this.state.selectedProject;
			const { hourExpectationsPerMember, fibonacchiScale } = this.state;

			let hourContributOptions = this.loadSelectOptions(hourExpectationsPerMember);
			let fibAsOptions = this.loadSelectOptions(fibonacchiScale);

			let sprintStories = Sprint.map((story) => {
				if (story.CreatedBy !== null) {

					return (
						(story.IsActive && (
							<div className="bubble log-row" style={{ margin: '5px 0 5px 0' }}>
								<ul>
									<li key={story.CreatedBy}>
										<div className="inner-log-row-left">
											<label>Creator: </label><span>{story.CreatedBy}</span>
										</div>
									</li>
									<li key={story.CreationDate}>
										<div className="inner-log-row-left">
											<label>Created On: </label><span>{story.CreationDate}</span>
										</div>
									</li>
									{(story.StartDate !== "") && (
										<li key={story.StartDate}>
											<div className="inner-log-row-left">
												<label>Started On: </label><span>{story.StartDate}</span>
											</div>
										</li>
									)}
									<li key={story.Description}>
										<div className="inner-log-row-left">
											<label>Description: </label><span>{story.Description}</span>
										</div>
									</li>
									<li key={story.StoryPointWeight}>
										<div className="inner-log-row-left">
											<label>Avg. Weight: </label><span>{story.StoryPointWeight}</span>
										</div>
									</li>
									{(story.StartDate !== "") && (
										<li>
											<div className="inner-log-row-left">
												<label>Contribute Hours:</label>
												<select style={{ height: '20px' }} onChange={(event) => this.contributeHours(event, story.Description)}>{hourContributOptions}</select>
											</div>
										</li>
									)}
									{story.IsOverdue && (
										<div>
											<li key={story.StoryPointWeight}>
												<div className="inner-log-row-left">
													<label>Completion: </label><span>{story.PercentComplete}%</span>
												</div>
											</li>
											<li>
												<div className="inner-log-row-left">
													<label>Update Weight:</label>
													<select style={{ height: '20px' }} onChange={(event) => this.updateStoryPointOpinionOverdue(event, story.Description)}>{fibAsOptions}</select>
												</div>
											</li>
										</div>
									)}
								</ul>
								{(story.StartDate !== "" && story.IsOverdue) && (
									<div className="button-stack">
										<button value={story.Description} onClick={() => this.completeStory(story.Description)} className="btn btn-danger common-button square-button">{<FontAwesomeIcon icon="angle-double-right" />}</button>
									</div>
								)}
								{(story.StartDate !== "" && !story.IsOverdue) && (
									<div className="button-stack">
										<button value={story.Description} onClick={() => this.completeStory(story.Description)} className="btn btn-primary common-button square-button">{<FontAwesomeIcon icon="angle-double-right" />}</button>
									</div>
								)}

								{(story.StartDate === "") && (
									<div className="button-stack">
										<button value={story.Description} onClick={() => this.startStory(story.Description)} className="btn btn-success common-button square-button">{<FontAwesomeIcon icon="hourglass-start" />}</button>
										<button style={{ margin: '5px 0' }} value={story.Description} onClick={() => this.moveToBacklog(story.Description)} className="btn btn-warning common-button square-button">{<FontAwesomeIcon icon="angle-double-left" />}</button>
									</div>
								)}
							</div>
						))
					)
				}
			});

			this.setState({
				sprintStories: sprintStories
			})
		}
	}
	/* End of renderSprint(). */



	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */
	/* ///////////////////////////////////////////// JSX Render /////////////////////////////////////////// */
	/* //////////////////////////////////////////////////////////////////////////////////////////////////// */

	render() {

		const { projectNames, projectDetails, selectedProject,
				isCreatingProject, isAddingUser, isCreatingStory,
				newProjectName, newUserName, newStoryDescription,
				backlogStories, sprintStories, members,
				isConfiguringSprint, fibonacchiScale, iterationLengthWeekOptions,
				hourExpectationsPerMember, sprintOver, sprintHistoryStories,
				completedStories, isReportShowing } = this.state;


		/* Validation for various Project creation fields. */
		const isProjectNameValid = newProjectName === undefined || newProjectName === "";
		const isProjectSelected = selectedProject === undefined;
		const isUserNameValid = newUserName === undefined || newUserName === "";
		const isStoryDescriptionValid = newStoryDescription === undefined || newStoryDescription === "";

		if (selectedProject) {
			this.calculateTotalSprintWeightAverage();
		}

		let fibAsOptions = this.loadSelectOptions(fibonacchiScale);
		let weeksAsOptions = this.loadSelectOptions(iterationLengthWeekOptions);
		let hoursAsOptions = this.loadSelectOptions(hourExpectationsPerMember);

		/* If no projects have been created, add a notification. */
		if (projectNames.length === 0) {
			projectNames.push(<li>No projects available!</li>);
		}


		return (
			<div className="project-wrapper">
				{/* Project Menu. */}
				<div className="sub-container project-nav">
					<h1 className="header header-left">Project Menu</h1>
					<div className="sub-container project-inner-wrapper">
						<PerfectScrollbar className="list-limiter">

						{/* Project selection menu to render rest of screen. */}
						<h5 className="project-sub-header">Available Projects:</h5>
						<ul className="project-list">
							{projectNames}
						</ul>

						{isCreatingProject && (
							<div className="sub-container">
								<label>Project Name:</label>
								<input onChange={this.registerProjectNameChange} type="text" className="project-list form-control" />
								{isProjectNameValid && (
									<div className="help-block error-text" style={{marginTop: 0}}>Project name is required!</div>
								)}

								<label>Description:</label>
								<input onChange={this.registerProjectDescriptionChange} type="text" className="project-list form-control input-format" />
								<div className="button-pair">
									<button onClick={this.cancelCreateProject} className="btn btn-danger btn-small common-button">Cancel Create</button>
									<button onClick={this.confirmCreateProject} disabled={isProjectNameValid} className="btn btn-success common-button">Confirm Project</button>
								</div>
							</div>
						)}

						{!isCreatingProject && (
							<div className="sub-container">
								<button onClick={this.startCreateProject} className="btn btn-primary common-button">Create Project</button>
							</div>
						)}

						{/* Hidden div that will not render until a project has been selected. */}
						{!isProjectSelected && (
							<div className="sub-container">
								{/* Project details. */}
								<h5 className="project-sub-header">Project Details:</h5>
								{projectDetails}

								{/* Project members by username. */}
								<h5 className="project-sub-header">Project Members:</h5>
								<ul className="project-list">
									{members}
								</ul>

								{/* User creation. */}
								{isAddingUser && (
									<div className="sub-container">
										<label>User Name:</label>
										<input onChange={this.registerUserNameChange} type="text" className="project-list form-control" />
										{isUserNameValid && (
											<div className="help-block error-text" style={{ marginTop: 0 }}>User name is required!</div>
										)}

										<div className="button-pair">
											<button onClick={this.cancelAddUserToProject} className="btn btn-danger btn-small common-button">Cancel Add</button>
											<button onClick={this.confirmAddUserToProject} disabled={isUserNameValid} className="btn btn-success common-button">Confirm User</button>
										</div>
									</div>
								)}

								{!isAddingUser && (
									<button onClick={this.startAddUserToProject} className="btn btn-primary common-button">Add User</button>
								)}

							</div>
							)}
						</PerfectScrollbar>
					</div>
				</div>


				{/* Project Backlog */}
				<div className="sub-container project-sprint">
					<div className="header-right">
						<h1 className="header-between">
							<span>Backlog</span>
							{(!isCreatingStory && !isProjectSelected) && (
								<button onClick={this.startCreateStory} className="btn btn-primary common-button">New Story</button>
							)}
						</h1>
					</div>
		
					<div className="sub-container project-inner-wrapper">
						{/* Backlog story creation. */}
						{isCreatingStory && (
							<div className="sub-container" style={{ marginTop: '10px' }}>
								<label>Story Description:</label>
								<input onChange={this.registerStoryDescriptionChange} type="text" className="project-list form-control" />
								{isStoryDescriptionValid && (
									<div className="help-block error-text" style={{ marginTop: 0 }}>Story description is required!</div>
								)}

								<label style={{ marginTop: '10px' }}>Weight:</label>
								<select style={{background: '#DEF2F1'}} onChange={(event) => this.setStoryPointScale(event)}>{fibAsOptions}</select>

								<div className="button-pair" style={{ marginTop: '10px' }}>
									<button onClick={this.cancelCreateStory} className="btn btn-danger btn-small common-button">Cancel Create</button>
									<button onClick={this.confirmCreateStory} disabled={isStoryDescriptionValid} className="btn btn-success common-button">Confirm Story</button>
								</div>
							</div>
						)}

						<h5 className="project-sub-header">Story Backlog: (Personal Weights)</h5>
						<PerfectScrollbar className="list-limiter">
							{!isProjectSelected && (
								<div className="backlog-content">						
									{(selectedProject.Backlog.length > 0) && (
										<ul>
											{backlogStories}
										</ul>
									)}
								</div>
							)}
						</PerfectScrollbar>
					</div>
				</div>


				{/* Project Sprint */}
				<div className="sub-container project-sprint" style={{ borderLeft: '1px solid white' }}>
					<div className="header-right">
						<h1 className="header-between">
							<span>Sprint</span>
							{(!isConfiguringSprint && !isProjectSelected) && (
								<div className="log-row">
									<button style={{ marginLeft: '10px' }} onClick={this.startSprintConfig} className="btn btn-primary common-button">Config</button>
								</div>
							)}
							{(isConfiguringSprint && !isProjectSelected) && (
								<div className="log-row">
									<button onClick={this.cancelSprintConfig} className="btn btn-warning btn-small common-button">Close</button>
								</div>
							)}
						</h1>
					</div>

					<div className="sub-container project-inner-wrapper">
						{/* Sprint Configuration */}
						{isConfiguringSprint && (
							<div className="sub-container">

								<label style={{ marginTop: '10px' }}>Sprint Start: (Automatic)</label>
								<span className="bubble" style={{ padding: '0.25vw' }}>{selectedProject.SprintConfig.StartDate}</span>

								<label style={{ marginTop: '10px' }}>Sprint End: (Automatic)</label>
								<span className="bubble" style={{ padding: '0.25vw' }}>{selectedProject.SprintConfig.EndDate}</span>

								<label style={{ marginTop: '10px' }}>Current Hour Quota:</label>
								<span className="bubble" style={{ padding: '0.25vw' }}>{selectedProject.SprintConfig.HourQuotaPerMember}</span>

								<label style={{ marginTop: '10px' }}>Change Hourly Quota:</label>
								<select style={{background: '#DEF2F1'}} onChange={(event) => this.updateHoursExpectedChange(event)}>{hoursAsOptions}</select>

								<label style={{ marginTop: '10px' }}>Weeks Per Sprint:</label>
								<span className="bubble" style={{ padding: '0.25vw' }}>{selectedProject.SprintConfig.IterationInWeeks}</span>

								<label style={{ marginTop: '10px' }}>Change Sprint Length</label>
								<select style={{background: '#DEF2F1'}} onChange={(event) => this.updateIterationLengthChange(event)}>{this.loadSelectOptions(iterationLengthWeekOptions)}</select>
							</div>
						)}

						<PerfectScrollbar className="list-limiter">
							<h5 className="project-sub-header">Sprint Stories:</h5>
							{!isProjectSelected && (
								<div className="backlog-content">
									{(selectedProject.Sprint.length > 0) && (
										<ul>
											{sprintStories}
										</ul>
									)}
								</div>
							)}
						</PerfectScrollbar>
					</div>
				</div>


				{/* Completed Stories */}
				<div className="sub-container project-backlog">
					<div className="header-right">
						<h1 className="header-between" style={{ borderTopRightRadius: '1vw' }}>
							<span>Completed</span>
							{(!isProjectSelected) && (
								<div className="log-row">
									{(!isReportShowing) && (
										<button style={{ marginLeft: '10px' }} onClick={this.showHistoricalReport} className="btn btn-primary common-button">Report</button>
									)}
									{(isReportShowing) && (
										<button style={{ marginLeft: '10px' }} onClick={this.closeHistoricalReport} className="btn btn-warning common-button">Close</button>
									)}
								</div>
							)}
						</h1>
					</div>

					<div className="sub-container project-inner-wrapper">
						<PerfectScrollbar className="list-limiter">
							{(!isProjectSelected && isReportShowing) && (
								<div>
									<h5 className="project-sub-header">Sprint History Report:</h5>
									<div className="backlog-content">
										{(selectedProject.Sprint.length > 0) && (
											<ul>
												{sprintHistoryStories}
											</ul>
										)}
									</div>
								</div>
							)}
							<h5 className="project-sub-header">Completed Stories:</h5>
							{!isProjectSelected && (
								<div className="backlog-content">
									{(selectedProject.Sprint.length > 0) && (
										<ul>
											{completedStories}
										</ul>
									)}
								</div>
							)}
						</PerfectScrollbar>
					</div>
				</div>
			</div>
		);
	}
	/* End of Render(). */
}
