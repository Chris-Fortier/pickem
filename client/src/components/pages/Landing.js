import React, { useState } from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
import jwtDecode from "jwt-decode";
import {
   MAX_USER_NAME_LENGTH,
   MAX_TEAM_NAME_LENGTH,
   MAX_USER_INITIALS_LENGTH,
} from "../../utils/helpers";

function Landing({ dispatch, history }) {
   const [mode, set_mode] = useState("log-in");
   const [newUserNameError, set_newUserNameError] = useState("");
   const [newInitialsError, set_newInitialsError] = useState("");
   const [newTeamNameError, set_newTeamNameError] = useState("");
   const [newPasswordError, set_newPasswordError] = useState("");
   const [currentUserNameError, set_currentUserNameError] = useState("");
   const [currentPasswordError, set_currentPasswordError] = useState("");

   function clearErrors() {
      set_newUserNameError("");
      set_newInitialsError("");
      set_newTeamNameError("");
      set_newPasswordError("");
      set_currentUserNameError("");
      set_currentPasswordError("");
   }

   // sends an API call to make a new user and if successful, pushes to new page depending on the type of user
   // works with any user type
   function postNewUserAndPush(user) {
      // post to API
      axios
         .post("/api/v1/users", user) // post to this endpoint the user object we just made
         .then((res) => {
            // TODO this is duplicated code, maybe make a function

            // set token in localStorage
            const authToken = res.data.accessToken;
            localStorage.setItem("authToken", authToken);
            console.log("authToken", authToken);

            const user = jwtDecode(authToken); // decode the user from the access token

            // send the user to Redux
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: user,
            });

            // set authorization headers for every request at the moment of log in
            axios.defaults.headers.common["x-auth-token"] = authToken;

            // go to home page
            history.push("/my-picks");
            window.scrollTo(0, 0); // sets focus to the top of the page
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_newUserNameError(data.newUserNameError);
            set_newTeamNameError(data.newTeamNameError);
            set_newInitialsError(data.newInitialsError);
            set_newPasswordError(data.newPasswordError);
         });
   }

   // tests if the user_name and password are valid and if so creates the user
   async function validateAndCreateUser(
      userNameInput,
      teamNameInput,
      initialsInput,
      passwordInput
   ) {
      // create user obj
      const user = {
         user_name: userNameInput,
         team_name: teamNameInput,
         initials: initialsInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      postNewUserAndPush(user);
   }

   // tests if the user_name and password are valid and if so logs in
   // works with any user type
   async function validateAndLogInUser(userNameInput, passwordInput) {
      const user = {
         user_name: userNameInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };
      // call API response:
      axios
         .post("/api/v1/users/auth", user)
         // .post("http://localhost:3060/api/v1/users/auth", user)
         .then((res) => {
            // set token in localStorage
            const authToken = res.data.accessToken;
            localStorage.setItem("authToken", authToken);
            // console.log("authToken", authToken);

            const user = jwtDecode(authToken); // decode the user from the access token

            // send the user to Redux
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: user,
            });

            // set authorization headers for every request at the moment of log in
            axios.defaults.headers.common["x-auth-token"] = authToken;

            // go to home page
            history.push("/my-picks");
            window.scrollTo(0, 0); // sets focus to the top of the page
         })
         .catch((err) => {
            console.log("err", err);
            const { data } = err.response;
            console.log("data", data);

            // push errors or lack thereof to state
            set_currentUserNameError(data.currentUserNameError);
            set_currentPasswordError(data.currentPasswordError);
         });
   }

   function renderLogin() {
      return (
         <div className="my-card">
            <div className="card-header">
               <h5>Log In</h5>
            </div>
            <div className="card-body">
               <form>
                  <div className="form-group">
                     <label htmlFor="user-name-input">User Name</label>
                     <input
                        type="text"
                        className="form-control"
                        id="user-name-input"
                        placeholder="Enter your user name."
                        // maxLength={MAX_USER_NAME_LENGTH} no max length for existing users
                     />
                     {currentUserNameError && (
                        <div className="text-danger">
                           {currentUserNameError}
                        </div>
                     )}
                  </div>
                  <div className="form-group">
                     <label htmlFor="password-input">Password</label>
                     <input
                        type="password"
                        className="form-control"
                        id="password-input"
                        placeholder="Enter your password."
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
                        validateAndLogInUser(
                           document.getElementById("user-name-input").value,
                           document.getElementById("password-input").value
                        )
                     }
                  >
                     Log in
                  </div>
                  <div
                     className="btn btn-secondary mt-3"
                     onClick={() => {
                        clearErrors();
                        set_mode("sign-up");
                        window.scrollTo(0, 0); // sets focus to the top of the page
                     }}
                  >
                     Make a new account
                  </div>
               </form>
            </div>
         </div>
      );
   }

   function renderSignup() {
      return (
         <div className="my-card">
            <div className="card-header">
               <h5>Sign Up</h5>
            </div>
            <div className="card-body">
               <form>
                  <div className="form-group">
                     <label htmlFor="user-name-input">User Name</label>
                     <input
                        type="text"
                        className="form-control"
                        id="user-name-input"
                        placeholder="Name for logging in"
                        maxLength={MAX_USER_NAME_LENGTH}
                     />
                     {newUserNameError && (
                        <div className="text-danger">{newUserNameError}</div>
                     )}
                  </div>
                  <div className="form-group">
                     <label htmlFor="team-name-input">Team Name</label>
                     <input
                        type="text"
                        className="form-control"
                        id="team-name-input"
                        placeholder="Public team name"
                        maxLength={MAX_TEAM_NAME_LENGTH}
                     />
                     {newTeamNameError && (
                        <div className="text-danger">{newTeamNameError}</div>
                     )}
                  </div>
                  <div className="form-group">
                     <label htmlFor="initials-input">Initials</label>
                     <input
                        type="text"
                        className="form-control"
                        id="initials-input"
                        // placeholder="Enter a 3-letter identifier."
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
                        placeholder="Enter a password."
                     />
                     {newPasswordError && (
                        <div className="text-danger">{newPasswordError}</div>
                     )}
                  </div>
                  <div
                     // type="submit"
                     className="btn btn-primary btn-block"
                     onClick={() => {
                        validateAndCreateUser(
                           document.getElementById("user-name-input").value,
                           document.getElementById("team-name-input").value,
                           document
                              .getElementById("initials-input")
                              .value.toUpperCase(),
                           document.getElementById("password-input").value
                        );
                     }}
                  >
                     Sign up
                  </div>
                  <div
                     className="btn btn-secondary mt-3"
                     onClick={() => {
                        clearErrors();
                        set_mode("log-in");
                        window.scrollTo(0, 0); // sets focus to the top of the page
                     }}
                  >
                     Use an existing account
                  </div>
               </form>
            </div>
         </div>
      );
   }

   return (
      <div className="my-container">
         <h1>
            Hawk Nation
            <br />
            NFL Pick 'em
         </h1>
         {/* render component based on what mode we are in */}
         {mode === "log-in" && renderLogin()}
         {mode === "sign-up" && renderSignup()}
      </div>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {};
}

export default connect(mapStateToProps)(Landing);
