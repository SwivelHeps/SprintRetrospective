import React, { Component } from 'react';
import "./style/login.css";

/* General string messages to give a central changing point. Use this 
 * if there is text that is repeated throughout the file. */
const UsernameRequired = "Username is required.";
const UsernameTaken = "Error: Username is taken!";
const PasswordRequired = "Username is required.";
const PasswordMismatch = "Error: Password mismatch!";

export class Login extends Component {
	displayName = Login.name

	state = {
		toggleLoginOrRegister: true,

		infoMismatch: false,

		loginUserName: "",
		loginPassword: "",

		registerFirstName: "",
		registerLastName: "",
		registerEmail: "",
		registerUserName: "",
		registerPassword: "",
		registerConfirmPassword: "",

		registerUserNameErrorText: UsernameRequired,
		registerPasswordErrorText: PasswordRequired
	}
	/* End of state initialization. */


	reportLogin = (data) => {
		this.props.loginCallback(data);
	}

	/* ///// Login Specific Functions ///// */

	login = async () => {

        const { loginPassword } = this.state;
        let potentialUserData;
        try {
        potentialUserData = await fetch('api/User/GetUserByUserName/' + this.state.loginUserName)
            .then((response) => {
                  return response.json();
                
            })
            .then((data) => {
                return data;
            });

        }
        catch (error) {
            potentialUserData = undefined;
        }

		if (potentialUserData !== undefined) {
			if (potentialUserData.Password === loginPassword) {
				this.reportLogin(potentialUserData);
                this.setState({
                    infoMismatch: false
                });
			}
			else {
                this.setState({
                    infoMismatch: true
                });
			}
		}
	}
	/* End of login(). */


	loginUserNameChange = (event) => {
		this.setState({ loginUserName: event.target.value });
	}
	/* End of loginUserNameChange(). */


	loginPasswordChange = (event) => {
		this.setState({
			loginPassword: event.target.value,
			infoMismatch: false
		});
	}
	/* End of loginPasswordChange(). */



	/* ///// Regristration Specific Functions ///// */

	registerFirstNameChange = (event) => {
		this.setState({ registerFirstName: event.target.value });
	}
	/* End of registerFirstNameChange(). */


	registerLastNameChange = (event) => {
		this.setState({ registerLastName: event.target.value });
	}
	/* End of registerLastNameChange(). */


	registerEmailChange = (event) => {
		this.setState({ registerEmail: event.target.value });
	}
	/* End of registerEmailChange(). */


	registerUserNameChange = (event) => {
		this.setState({
			registerUserName: event.target.value,
			registerUserNameErrorText: UsernameRequired
		});
	}
	/* End of registerUserNameChange(). */


	registerPasswordChange = (event) => {
		this.setState({
			registerPassword: event.target.value,
			registerPasswordErrorText: PasswordRequired
		});
	}
	/* End of registerPasswordChange(). */


	registerConfirmPasswordChange = (event) => {
		this.setState({
			registerConfirmPassword: event.target.value,
			registerPasswordErrorText: PasswordRequired
		});
	}
	/* End of registerConfirmPasswordChange(). */


	register = async () => {

		const { registerFirstName, registerLastName, registerEmail, registerUserName, registerPassword, registerConfirmPassword } = this.state;

		/* Confirm passwords are the same. */
		if (registerPassword === registerConfirmPassword) {

			/* Check that the selected UserName is avaiable. */
			let potentialUserData = await fetch('api/User/GetUserByUserName/' + this.state.registerUserName)
				.then((response) => {
					/* If 204, the name is available, return undefined. */
					if (response.status === 204) {
						return undefined;
					}
					else {
						return response.json()
					}
				})
				.then((data) => {
					return data;
				})

			if (potentialUserData !== undefined) {
				this.setState({
					registerUserNameErrorText: UsernameTaken
				})
			}
			else {
				fetch('api/User/AddNewUser', {
					credentials: 'same-origin',
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json '
					},
					body: JSON.stringify({
						UserName: registerUserName,
						FirstName: registerFirstName,
						LastName: registerLastName,
						Email: registerEmail,
						Password: registerPassword,
					})
				}).then((data) => {
					this.setState({
						toggleLoginOrRegister: true,
						infoMismatch: false,

						loginUserName: registerUserName,
						loginPassword: "",

						registerFirstName: "",
						registerLastName: "",
						registerEmail: "",
						registerUserName: "",
						registerPassword: "",
						registerConfirmPassword: "",
					})
				})
				.catch((error) => {
					console.error(error);
				})
			}
		}
		else {
			/* The password fields are not the same. */
			this.setState({
				registerPasswordErrorText: PasswordMismatch
			});
		}
	}
	/* End of register(). */


	/* ///// Shared Functions ///// */

	toggleRegisterOrLogin = () => {
		this.setState({
			toggleLoginOrRegister: !this.state.toggleLoginOrRegister
		});
	};
	/* End of toggleRegisterOrLogin(). */

	render() {

		const { toggleLoginOrRegister, infoMismatch, loginUserName, loginPassword, registerFirstName, registerLastName, registerEmail, registerUserName, registerPassword, registerConfirmPassword, registerUserNameErrorText, registerPasswordErrorText } = this.state;

		/* Validation for Login. */
		const isLoginUserName = loginUserName === undefined || loginUserName === "";
		const isLoginPassword = loginPassword === undefined || loginPassword === "";

		/* Validation for Registration. */
		const isRegisterFirstName = registerFirstName === undefined || registerFirstName === "";
		const isRegisterLastName = registerLastName === undefined || registerLastName === "";
		const isRegisterEmail = registerEmail === undefined || registerEmail === "";
		const isRegisterUserName = registerUserName === undefined || registerUserName === "" || registerUserNameErrorText === UsernameTaken;
		const isRegisterPassword = registerPassword === undefined || registerPassword === "";
		const isRegisterConfirmPassword = registerConfirmPassword === undefined || registerConfirmPassword === "" || registerPasswordErrorText === PasswordMismatch;

		return (
			<div className="login-wrapper">
				{toggleLoginOrRegister && (
					<div className="login-inner-wrapper">
						<h2>Login</h2>
						<div className = "login-username">
							<label htmlFor="username">Username</label>
							<input onChange={this.loginUserNameChange} type="text" className="form-control" name="username" />
							{isLoginUserName && (
								<div className="help-block error-text">Username is required!</div>
							)}
						</div>

						<div className="login-password">
							<label htmlFor="password">Password</label>
							<input onChange={this.loginPasswordChange} type="password" className="form-control" name="password" />
							{isLoginPassword && (
								<div className="help-block error-text">Password is required.</div>
							)}
							{infoMismatch && (
								<div className="help-block error-text">Information Mismatch.</div>
							)}
						</div>

						<div className="form-group">
							<button disabled={isLoginUserName || isLoginPassword} onClick={this.login} className="btn btn-primary">Login</button>
							<button onClick={this.toggleRegisterOrLogin} className="btn btn-link">Register</button>
						</div>
					</div>
				)}

				{!toggleLoginOrRegister && (
					<div className="login-inner-wrapper">
						<h2>Register</h2>
						<div className = "reg-firstname">
							<label htmlFor="firstName">First Name</label>
							<input onChange={this.registerFirstNameChange} type="text" className="form-control" name="username" />
							{isRegisterFirstName && (
								<div className="help-block error-text">First name is required.</div>
							)}
						</div>

						<div className="reg-lastname">
							<label htmlFor="LastName">Last Name</label>
							<input onChange={this.registerLastNameChange} type="text" className="form-control" name="password" />
							{isRegisterLastName && (
								<div className="help-block error-text">Last name is required.</div>
							)}
						</div>

						<div className="reg-email">
							<label htmlFor="email">E-mail</label>
							<input onChange={this.registerEmailChange} type="text" className="form-control" name="password" />
							{isRegisterEmail && (
								<div className="help-block error-text">E-mail is required.</div>
							)}
						</div>

						<div className="reg-username">
							<label htmlFor="username">Username</label>
							<input onChange={this.registerUserNameChange} type="text" className="form-control" name="username" />
							{isRegisterUserName && (
								<div className="help-block error-text">{registerUserNameErrorText}</div>
							)}
						</div>

						<div className="reg-password">
							<label htmlFor="password">Password</label>
							<input onChange={this.registerPasswordChange} type="password" className="form-control" name="password" />
							{isRegisterPassword && (
								<div className="help-block error-text">Password is required.</div>
							)}
						</div>

						<div className="reg-re-password">
							<label htmlFor="password">Re-enter Password</label>
							<input onChange={this.registerConfirmPasswordChange} type="password" className="form-control" name="password" />
							{isRegisterConfirmPassword && (
								<div className="help-block error-text">{registerPasswordErrorText}</div>
							)}
						</div>

						<div className="form-group">
							<button disabled={isRegisterFirstName || isRegisterLastName || isRegisterEmail || isRegisterUserName || isRegisterPassword || isRegisterConfirmPassword } onClick={this.register} className="btn btn-primary">Register</button>
							<button onClick={this.toggleRegisterOrLogin} className="btn btn-link">Login</button>
						</div>
					</div>
				)}
			</div >
		);
	}
}
