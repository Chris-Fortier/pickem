import React from "react";
import NavBar from "../ui/NavBar";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
// import jwtDecode from "jwt-decode";

class AccountSettings extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor

      this.state = {
         mode: "account-settings-menu", // dictates what is rendered
         messageFromServer: "",

         // errors
         newUserNameError: "",
         currentPasswordError: "",
         newPasswordError: "",
      };
   }

   clearMessageAndErrors() {
      this.setState({
         messageFromServer: "",
         newUserNameError: "",
         currentPasswordError: "",
         newPasswordError: "",
      });
   }

   // tests if the new user_name and password are valid and if so changes user_name
   async validateAndChangeUserName(userNameInput, passwordInput) {
      // create the object that will be the body that is sent
      const submission = {
         newUserName: userNameInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-user-name", submission)
         .then((res) => {
            const oldUserName = this.props.currentUser.user_name; // storing old name so I can put it in the message
            // send the user with new name to Redux
            this.props.currentUser.user_name = userNameInput;
            this.props.dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: this.props.currentUser,
            });

            // TODO: local token is not updated with the new user_name, but I don't think I am using that user_name for anything
            // if they refresh it will put the user_name from token in currentUser

            this.clearMessageAndErrors();
            this.setState({
               messageFromServer: `User name changed from ${oldUserName} to ${userNameInput}`,
               mode: "account-settings-menu",
            });
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);
            const { newUserNameError, currentPasswordError } = data;

            // push errors or lack thereof to state
            this.setState({
               newUserNameError,
               currentPasswordError,
            });
         });
   }

   // tests if the old password is valid and if so changes password to new one
   async validateAndChangePassword(currentPasswordInput, newPasswordInput) {
      // create the object that will be the body that is sent
      const submission = {
         currentPassword: currentPasswordInput, // send the plain text password over secure connection, the server will hash it
         newPassword: newPasswordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-password", submission)
         .then((res) => {
            const data = res.data;

            this.clearMessageAndErrors();
            this.setState(data); // the data received from server has the same keywords as state variables
            this.setState({ mode: "account-settings-menu" });
         })
         .catch((err) => {
            const data = err.response.data;

            this.clearMessageAndErrors();
            this.setState(data); // the data received from server has the same keywords as state variables
         });
   }

   // renders the account settings menu buttons
   renderAccountSettingsMenu() {
      return (
         <>
            <button
               type="button"
               className="btn btn-primary btn-block"
               onClick={() => {
                  this.clearMessageAndErrors();
                  this.setState({ mode: "change-password" });
               }}
            >
               Change Password...
            </button>
            <button
               type="button"
               className="btn btn-secondary btn-block"
               onClick={() => {
                  this.clearMessageAndErrors();
                  this.setState({ mode: "change-user-name" });
               }}
            >
               Change User Name...
            </button>
         </>
      );
   }

   renderChangeUserName() {
      return (
         <>
            <h5>Change User Name</h5>
            <form>
               <div className="form-group">
                  <label htmlFor="new-user-name-input">New User Name</label>
                  <input
                     type="text"
                     className="form-control"
                     id="new-user-name-input"
                     placeholder={this.props.currentUser.user_name}
                  />
                  {this.state.newUserNameError && (
                     <div className="text-danger">
                        {this.state.newUserNameError}
                     </div>
                  )}
               </div>
               <div className="form-group">
                  <label htmlFor="password-input">Password</label>
                  <input
                     type="password"
                     className="form-control"
                     id="password-input"
                     placeholder="Enter your password"
                  />
                  {this.state.currentPasswordError && (
                     <div className="text-danger" id="password-error">
                        {this.state.currentPasswordError}
                     </div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     this.validateAndChangeUserName(
                        document.getElementById("new-user-name-input").value,
                        document.getElementById("password-input").value
                     )
                  }
               >
                  Change User Name
               </div>
               <div
                  className="btn btn-secondary mt-3"
                  onClick={() => {
                     this.clearMessageAndErrors();
                     this.setState({ mode: "account-settings-menu" });
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   // TODO: add this to Chav Lads
   renderChangePassword() {
      return (
         <>
            <h5>Change Password</h5>
            <form>
               <div className="form-group">
                  <label htmlFor="current-password-input">
                     Current Password
                  </label>
                  <input
                     type="password"
                     className="form-control"
                     id="current-password-input"
                     placeholder="Enter your existing password."
                  />
                  {this.state.currentPasswordError && (
                     <div className="text-danger">
                        {this.state.currentPasswordError}
                     </div>
                  )}
               </div>
               <div className="form-group">
                  <label htmlFor="new-password-input">New Password</label>
                  <input
                     type="password"
                     className="form-control"
                     id="new-password-input"
                     placeholder="Enter a new password"
                  />
                  {this.state.newPasswordError && (
                     <div className="text-danger">
                        {this.state.newPasswordError}
                     </div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     this.validateAndChangePassword(
                        document.getElementById("current-password-input").value,
                        document.getElementById("new-password-input").value
                     )
                  }
               >
                  Change Password
               </div>
               <div
                  className="btn btn-secondary mt-3"
                  onClick={() => {
                     this.clearMessageAndErrors();
                     this.setState({ mode: "account-settings-menu" });
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   render() {
      return (
         <>
            <NavBar />
            <div className="container">
               <div className="row">
                  <div className="col col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                     <div className="card mt-5 mb-5">
                        <div className="card-header">
                           <h2>
                              Account Settings
                              {/* &nbsp;for&nbsp;
                              {this.props.currentUser.user_name} */}
                           </h2>
                        </div>
                        <div className="card-body">
                           {this.state.messageFromServer && (
                              <p>{this.state.messageFromServer}</p>
                           )}
                           {/* render component based on what mode we are in */}
                           {this.state.mode === "account-settings-menu" &&
                              this.renderAccountSettingsMenu()}
                           {this.state.mode === "change-user-name" &&
                              this.renderChangeUserName()}
                           {this.state.mode === "change-password" &&
                              this.renderChangePassword()}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { currentUser: state.currentUser };
}

export default connect(mapStateToProps)(AccountSettings);
