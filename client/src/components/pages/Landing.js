import React, { useState } from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
import jwtDecode from "jwt-decode";
import {
   MAX_USER_NAME_LENGTH,
   MAX_EMAIL_LENGTH,
   MAX_TEAM_NAME_LENGTH,
   MAX_USER_INITIALS_LENGTH,
} from "../../utils/helpers";

function Input({
   name,
   label,
   placeholder = "",
   max_length, // optional
   error_message,
   style = {},
}) {
   return (
      <div className="form-group">
         <label htmlFor={`${name}-input`}>{label}</label>
         <input
            type="text"
            className="form-control"
            id={`${name}-input`}
            placeholder={placeholder}
            maxLength={max_length}
            style={style}
         />
         {error_message && <div className="text-danger">{error_message}</div>}
      </div>
   );
}

function Landing({ dispatch, history }) {
   const [mode, set_mode] = useState("log-in");
   const [newUserNameError, set_newUserNameError] = useState("");
   const [new_email_error, set_new_email_error] = useState("");
   const [newInitialsError, set_newInitialsError] = useState("");
   const [newTeamNameError, set_newTeamNameError] = useState("");
   const [newPasswordError, set_newPasswordError] = useState("");
   const [currentUserNameError, set_currentUserNameError] = useState("");
   const [currentPasswordError, set_currentPasswordError] = useState("");

   function clearErrors() {
      set_newUserNameError("");
      set_new_email_error("");
      set_newTeamNameError("");
      set_newInitialsError("");
      set_newPasswordError("");
      set_currentUserNameError("");
      set_currentPasswordError("");
   }

   // what happens when a user logs in
   function log_in(res) {
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
   }

   // sends an API call to make a new user and if successful, pushes to new page depending on the type of user
   // works with any user type
   function postNewUserAndPush(user) {
      // post to API
      axios
         .post("/api/v1/users", user) // post to this endpoint the user object we just made
         .then((res) => {
            log_in(res);
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_newUserNameError(data.newUserNameError);
            set_new_email_error(data.new_email_error);
            set_newTeamNameError(data.newTeamNameError);
            set_newInitialsError(data.newInitialsError);
            set_newPasswordError(data.newPasswordError);
         });
   }

   // tests if the user_name and password are valid and if so creates the user
   async function validateAndCreateUser(
      userNameInput,
      email_input,
      teamNameInput,
      initialsInput,
      passwordInput
   ) {
      // create user obj
      const user = {
         user_name: userNameInput,
         email: email_input,
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
            log_in(res);
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
                  <Input
                     name="user-name"
                     label="User Name"
                     placeholder="Enter your user name."
                     error_message={currentUserNameError}
                  />
                  <Input
                     name="password"
                     label="Password"
                     placeholder="Enter your password."
                     error_message={currentPasswordError}
                  />
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
                  <Input
                     name="user-name"
                     label="User Name"
                     placeholder="Name for logging in"
                     max_length={MAX_USER_NAME_LENGTH}
                     error_message={newUserNameError}
                  />
                  <Input
                     name="email"
                     label="Email Address (optional)"
                     placeholder="Enter your email"
                     max_length={MAX_EMAIL_LENGTH}
                     error_message={new_email_error}
                  />
                  <Input
                     name="team-name"
                     label="Team Name"
                     placeholder="Public team name"
                     max_length={MAX_TEAM_NAME_LENGTH}
                     error_message={newTeamNameError}
                  />
                  <Input
                     name="initials"
                     label="Initials"
                     max_length={MAX_USER_INITIALS_LENGTH}
                     error_message={newInitialsError}
                     style={{ textTransform: "uppercase" }}
                  />
                  <Input
                     name="password"
                     label="Password"
                     placeholder="Enter a password."
                     max_length={50}
                     error_message={newPasswordError}
                  />
                  <div
                     // type="submit"
                     className="btn btn-primary btn-block"
                     onClick={() => {
                        validateAndCreateUser(
                           document.getElementById("user-name-input").value,
                           document.getElementById("email-input").value,
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
