import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
// import jwtDecode from "jwt-decode";
import isEmpty from "lodash/isEmpty";
import {
   MAX_USER_NAME_LENGTH,
   MAX_TEAM_NAME_LENGTH,
   MAX_USER_INITIALS_LENGTH,
   logOutCurrentUser,
} from "../../utils/helpers";

function AccountSettings({ currentUser, history, dispatch }) {
   const [mode, set_mode] = useState("account-settings-menu");
   const [messageFromServer, set_messageFromServer] = useState("");
   const [currentPasswordError, set_currentPasswordError] = useState("");
   const [newUserNameError, set_newUserNameError] = useState("");
   const [newTeamNameError, set_newTeamNameError] = useState("");
   const [newInitialsError, set_newInitialsError] = useState("");
   const [newPasswordError, set_newPasswordError] = useState("");

   useEffect(() => {
      // if there is not user logged in
      if (isEmpty(currentUser)) {
         // send to landing page
         history.push("/");
      } else {
      }
   }, [currentUser, history]);

   function clearMessageAndErrors() {
      set_messageFromServer("");
      set_mode(mode);
      set_currentPasswordError("");
      set_newUserNameError("");
      set_newTeamNameError("");
      set_newInitialsError("");
      set_newPasswordError("");
   }

   const cancelSubMenu = () => {
      set_messageFromServer("");
      set_mode("account-settings-menu");
      set_currentPasswordError("");
      set_newUserNameError("");
      set_newTeamNameError("");
      set_newInitialsError("");
      set_newPasswordError("");
   };

   const updateMessageAndReturn = (new_message) => {
      set_messageFromServer(new_message);
      set_mode("account-settings-menu");
      set_currentPasswordError("");
      set_newUserNameError("");
      set_newTeamNameError("");
      set_newInitialsError("");
      set_newPasswordError("");
   };

   const enterSubMenu = (sub_menu) => {
      set_messageFromServer("");
      set_mode(sub_menu);
      set_currentPasswordError("");
      set_newUserNameError("");
      set_newTeamNameError("");
      set_newInitialsError("");
      set_newPasswordError("");
   };

   // tests if the new user_name and password are valid and if so changes user_name
   async function validateAndChangeUserName(userNameInput, passwordInput) {
      // create the object that will be the body that is sent
      const submission = {
         newUserName: userNameInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-user-name", submission)
         .then((res) => {
            const oldUserName = currentUser.user_name; // storing old name so I can put it in the message
            // send the user with new name to Redux
            currentUser.user_name = userNameInput;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: currentUser,
            });

            // TODO: local token is not updated with the new user_name, but I don't think I am using that user_name for anything
            // if they refresh it will put the user_name from token in currentUser

            updateMessageAndReturn(
               `User name changed from "${oldUserName}" to "${userNameInput}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_newUserNameError(data.newUserNameError);
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   // tests if the new initials and password are valid and if so changes initials
   async function validateAndChangeInitials(initialsInput, passwordInput) {
      // TODO: do not allow initials that are already in use

      // create the object that will be the body that is sent
      const submission = {
         newInitials: initialsInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-initials", submission)
         .then((res) => {
            const oldInitials = currentUser.initials; // storing old name so I can put it in the message
            // send the user with new name to Redux
            currentUser.initials = initialsInput;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: currentUser,
            });

            // TODO: local token is not updated with the new initials, but I don't think I am using that initials for anything
            // if they refresh it will put the initials from token in currentUser

            updateMessageAndReturn(
               `User initials changed from "${oldInitials}" to "${initialsInput}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_newInitialsError(data.newInitialsError);
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   // tests if the new team name and password are valid and if so changes team name
   async function validateAndChangeTeamName(teamNameInput, passwordInput) {
      // create the object that will be the body that is sent
      const submission = {
         newTeamName: teamNameInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-team-name", submission)
         .then((res) => {
            const oldTeamName = currentUser.team_name; // storing old name so I can put it in the message
            // send the user with new name to Redux
            currentUser.team_name = teamNameInput;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: currentUser,
            });

            // TODO: local token is not updated with the new team name, but I don't think I am using that team name for anything
            // if they refresh it will put the team name from token in currentUser

            updateMessageAndReturn(
               `Team name changed from "${oldTeamName}" to "${teamNameInput}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_newTeamNameError(data.newTeamNameError);
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   // tests if the old password is valid and if so changes password to new one
   async function validateAndChangePassword(
      currentPasswordInput,
      newPasswordInput
   ) {
      // create the object that will be the body that is sent
      const submission = {
         currentPassword: currentPasswordInput, // send the plain text password over secure connection, the server will hash it
         newPassword: newPasswordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-password", submission)
         .then((res) => {
            updateMessageAndReturn("Password changed.");

            // updateState(data); // the data received from server has the same keywords as state variables
         })
         .catch((err) => {
            const data = err.response.data;

            // push errors or lack thereof to state
            set_newPasswordError(data.newPasswordError);
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   // tests if the password is valid and if so deletes the account
   async function validateAndDeleteAccount(currentPasswordInput) {
      // create the object that will be the body that is sent
      const submission = {
         currentPassword: currentPasswordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/delete", submission)
         .then((res) => {
            clearMessageAndErrors();
            set_messageFromServer("This account has been deleted");
            set_mode("account-settings-menu");
            logOutCurrentUser();
            history.push("/");
         })
         .catch((err) => {
            const data = err.response.data;

            // push errors or lack thereof to state
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   // renders the account settings menu buttons
   function renderAccountSettingsMenu() {
      return (
         <>
            <button
               type="button"
               className="btn btn-primary btn-block"
               onClick={() => {
                  enterSubMenu("change-password");
               }}
            >
               Change Password...
            </button>
            <button
               type="button"
               className="btn btn-secondary btn-block"
               onClick={() => {
                  enterSubMenu("change-user-name");
               }}
            >
               Change User Name...
            </button>
            <button
               type="button"
               className="btn btn-secondary btn-block"
               onClick={() => {
                  enterSubMenu("change-team-name");
               }}
            >
               Change Team Name...
            </button>
            <button
               type="button"
               className="btn btn-secondary btn-block"
               onClick={() => {
                  enterSubMenu("change-initials");
               }}
            >
               Change Initials...
            </button>
            <button
               type="button"
               className="btn btn-secondary text-danger btn-block"
               onClick={() => {
                  enterSubMenu("delete-account");
               }}
            >
               Delete Account...
            </button>
            <button
               type="button"
               className="btn btn-secondary mt-2"
               onClick={() => {
                  logOutCurrentUser();
                  history.push("/");
               }}
            >
               Log out
            </button>
         </>
      );
   }

   function renderChangeUserName() {
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
                     placeholder={currentUser.user_name}
                     maxLength={MAX_USER_NAME_LENGTH}
                  />
                  {newUserNameError && (
                     <div className="text-danger">{newUserNameError}</div>
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
                  {currentPasswordError && (
                     <div className="text-danger" id="password-error">
                        {currentPasswordError}
                     </div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     validateAndChangeUserName(
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
                     cancelSubMenu();
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   function renderChangeInitials() {
      return (
         <>
            <h5>Change Initials</h5>
            <form>
               <div className="form-group">
                  <label htmlFor="new-initials-input">New Initials</label>
                  <input
                     type="text"
                     className="form-control"
                     id="new-initials-input"
                     placeholder={currentUser.initials}
                     maxLength={MAX_USER_INITIALS_LENGTH}
                     style={{ textTransform: "uppercase" }}
                  />
                  {newInitialsError && (
                     <div className="text-danger">{newInitialsError}</div>
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
                  {currentPasswordError && (
                     <div className="text-danger" id="password-error">
                        {currentPasswordError}
                     </div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     validateAndChangeInitials(
                        document
                           .getElementById("new-initials-input")
                           .value.toUpperCase(),
                        document.getElementById("password-input").value
                     )
                  }
               >
                  Change Initials
               </div>
               <div
                  className="btn btn-secondary mt-3"
                  onClick={() => {
                     cancelSubMenu();
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   function renderChangeTeamName() {
      // TODO: do not allow a team name that is already in use
      return (
         <>
            <h5>Change Team Name</h5>
            <form>
               <div className="form-group">
                  <label htmlFor="new-team-name-input">New Team Name</label>
                  <input
                     type="text"
                     className="form-control"
                     id="new-team-name-input"
                     placeholder={currentUser.team_name}
                     maxLength={MAX_TEAM_NAME_LENGTH}
                  />
                  {newTeamNameError && (
                     <div className="text-danger">{newTeamNameError}</div>
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
                  {currentPasswordError && (
                     <div className="text-danger" id="password-error">
                        {currentPasswordError}
                     </div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     validateAndChangeTeamName(
                        document.getElementById("new-team-name-input").value,
                        document.getElementById("password-input").value
                     )
                  }
               >
                  Change Team Name
               </div>
               <div
                  className="btn btn-secondary mt-3"
                  onClick={() => {
                     cancelSubMenu();
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   function renderChangePassword() {
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
                  {currentPasswordError && (
                     <div className="text-danger">{currentPasswordError}</div>
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
                  {newPasswordError && (
                     <div className="text-danger">{newPasswordError}</div>
                  )}
               </div>
               <div
                  // type="submit"
                  className="btn btn-primary btn-block"
                  onClick={() =>
                     validateAndChangePassword(
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
                     cancelSubMenu();
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

   function renderDeleteAccount() {
      return (
         <>
            <h5>Delete Account</h5>
            <form>
               <div className="form-group">
                  <label htmlFor="current-password-input">Password</label>
                  <input
                     type="password"
                     className="form-control"
                     id="current-password-input"
                     placeholder="Enter your password."
                  />
                  {currentPasswordError && (
                     <div className="text-danger">{currentPasswordError}</div>
                  )}
               </div>
               <p>
                  Are you sure you want to delete account&nbsp;"
                  {currentUser.user_name}"?
               </p>
               <div
                  // type="submit"
                  className="btn btn-danger btn-block"
                  onClick={() =>
                     validateAndDeleteAccount(
                        document.getElementById("current-password-input").value
                     )
                  }
               >
                  Delete Account
               </div>
               <div
                  className="btn btn-secondary mt-3"
                  onClick={() => {
                     cancelSubMenu();
                  }}
               >
                  Cancel
               </div>
            </form>
         </>
      );
   }

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
                           {currentUser.user_name} */}
                        </h2>
                     </div>
                     <div className="card-body">
                        {messageFromServer && <p>{messageFromServer}</p>}
                        {/* render component based on what mode we are in */}
                        {mode === "account-settings-menu" &&
                           renderAccountSettingsMenu()}
                        {mode === "change-user-name" && renderChangeUserName()}
                        {mode === "change-team-name" && renderChangeTeamName()}
                        {mode === "change-initials" && renderChangeInitials()}
                        {mode === "change-password" && renderChangePassword()}
                        {mode === "delete-account" && renderDeleteAccount()}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { currentUser: state.currentUser };
}

export default connect(mapStateToProps)(AccountSettings);
