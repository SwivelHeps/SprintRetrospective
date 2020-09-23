
import React, { Component } from 'react';
import { Login } from './Login';
import { Projects } from './Projects'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDoubleLeft, faAngleDoubleRight, faUsersCog, faHourglassStart, faStopCircle, faHourglassEnd, pa } from '@fortawesome/free-solid-svg-icons'

import './style/Navigation.css';

library.add(faAngleDoubleLeft);
library.add(faAngleDoubleRight);
library.add(faUsersCog);
library.add(faHourglassStart);
library.add(faHourglassEnd);
library.add(faStopCircle);

export class Navigation extends Component {

	state = {
		loginTab: true,
		userData: []
	}

	loginCallback = (data) => {
		this.setState({
			loginTab: false,
			userData: data
		});
	}

	logoff = () => {
		this.setState({
			loginTab: true,
			userData: []
		})
	}

	/* TODO: Configure the logged in status to hide the projects tab
	 *		 until the user has logged in. 
	 * Note: Currently loggedIn is set to false by default to show this 
	 *		 for GUI development prior to login capabilities. */
	render() {

		const { loginTab, userData } = this.state;

		return (

			<div>
				<div className="nav">
					<div className="nav-text logo">
						Sprint Retrospective
					</div>
					{!loginTab && (<div onClick={this.logoff} className="nav-text link">Logoff</div>)}
				</div>

				{loginTab && (<Login loginCallback={this.loginCallback} />)}
				{!loginTab && (<Projects userData={userData} />)}
			</div>
		);
	}
}
