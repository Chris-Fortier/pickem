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
import Input from "../ui/Input";
import Button from "../ui/Button";

function Landing({ dispatch, history }) {
   const [mode, set_mode] = useState("log-in");
   const [new_user_name_error, set_new_user_name_error] = useState("");
   const [new_email_error, set_new_email_error] = useState("");
   const [new_initials_error, set_new_initials_error] = useState("");
   const [new_team_name_error, set_new_team_name_error] = useState("");
   const [new_password_error, set_new_password_error] = useState("");
   const [current_user_name_error, set_current_user_name_error] = useState("");
   const [current_password_error, set_current_password_error] = useState("");

   function clear_errors() {
      set_new_user_name_error("");
      set_new_email_error("");
      set_new_team_name_error("");
      set_new_initials_error("");
      set_new_password_error("");
      set_current_user_name_error("");
      set_current_password_error("");
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
   function post_new_user_and_push(user) {
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
            set_new_user_name_error(data.new_user_name_error);
            set_new_email_error(data.new_email_error);
            set_new_team_name_error(data.new_team_name_error);
            set_new_initials_error(data.new_initials_error);
            set_new_password_error(data.new_password_error);
         });
   }

   // tests if the user_name and password are valid and if so creates the user
   async function validate_and_create_user(
      user_name_input,
      email_input,
      team_name_input,
      initials_input,
      password_input
   ) {
      // create user obj
      const user = {
         user_name: user_name_input,
         email: email_input,
         team_name: team_name_input,
         initials: initials_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };

      post_new_user_and_push(user);
   }

   // tests if the user_name and password are valid and if so logs in
   // works with any user type
   async function validate_and_log_in_user(user_name_input, password_input) {
      const user = {
         user_name: user_name_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
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
            set_current_user_name_error(data.current_user_name_error);
            set_current_password_error(data.current_password_error);
         });
   }

   function render_log_in() {
      return (
         <div className="my-card">
            <div className="card-header">
               <h5>Log In</h5>
            </div>
            <div className="card-body">
               <form>
                  <Input
                     double
                     name="user-name"
                     label="User Name"
                     placeholder="Enter your user name."
                     error_message={current_user_name_error}
                  />
                  <Input
                     double
                     name="password"
                     label="Password"
                     type="password"
                     placeholder="Enter your password."
                     error_message={current_password_error}
                  />
                  <Button
                     label="Log in"
                     primary
                     block
                     action={() =>
                        validate_and_log_in_user(
                           document.getElementById("user-name-input").value,
                           document.getElementById("password-input").value
                        )
                     }
                  />
                  <Button
                     label="Make a new account..."
                     secondary
                     action={() => {
                        clear_errors();
                        set_mode("sign-up");
                        window.scrollTo(0, 0); // sets focus to the top of the page
                     }}
                     style={{ marginBottom: 0 }} // inline buttons have margins below them that need to be removed if they are the last one in its container
                  />
               </form>
            </div>
         </div>
      );
   }

   // NOTE: if I make these functional components, the inputs clear when the user clicks the submit button if there are errors
   function render_sign_up() {
      return (
         <div className="my-card">
            <div className="card-header">
               <h5>Sign Up</h5>
            </div>
            <div className="card-body">
               <form>
                  <Input
                     double
                     name="user-name"
                     label="User Name"
                     placeholder="Name for logging in"
                     max_length={MAX_USER_NAME_LENGTH}
                     error_message={new_user_name_error}
                  />
                  <Input
                     double
                     name="email"
                     label="Email Address (optional)"
                     placeholder="Enter your email"
                     max_length={MAX_EMAIL_LENGTH}
                     error_message={new_email_error}
                  />
                  <Input
                     double
                     name="team-name"
                     label="Team Name"
                     placeholder="Public team name"
                     max_length={MAX_TEAM_NAME_LENGTH}
                     error_message={new_team_name_error}
                  />
                  <Input
                     double
                     name="initials"
                     label="Initials"
                     max_length={MAX_USER_INITIALS_LENGTH}
                     error_message={new_initials_error}
                     style={{ textTransform: "uppercase" }}
                  />
                  <Input
                     double
                     name="password"
                     label="Password"
                     type="password"
                     placeholder="Enter a password."
                     max_length={50}
                     error_message={new_password_error}
                  />
                  <Button
                     label="Sign up"
                     primary
                     block
                     action={() => {
                        validate_and_create_user(
                           document.getElementById("user-name-input").value,
                           document.getElementById("email-input").value,
                           document.getElementById("team-name-input").value,
                           document
                              .getElementById("initials-input")
                              .value.toUpperCase(),
                           document.getElementById("password-input").value
                        );
                     }}
                  />
                  <Button
                     label="Use an existing account..."
                     secondary
                     action={() => {
                        clear_errors();
                        set_mode("log-in");
                        window.scrollTo(0, 0); // sets focus to the top of the page
                     }}
                     style={{ marginBottom: 0 }} // inline buttons have margins below them that need to be removed if they are the last one in its container
                  />
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
         {mode === "log-in" && render_log_in()}
         {mode === "sign-up" && render_sign_up()}
      </div>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {};
}

export default connect(mapStateToProps)(Landing);
