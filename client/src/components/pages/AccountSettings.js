import React, { useState, useEffect } from "react";
import NavBar from "../ui/NavBar";
import Input from "../ui/Input";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
// import jwtDecode from "jwt-decode";
import isEmpty from "lodash/isEmpty";
import Button from "../ui/Button";
import {
   MAX_USER_NAME_LENGTH,
   MAX_EMAIL_LENGTH,
   MAX_TEAM_NAME_LENGTH,
   MAX_USER_INITIALS_LENGTH,
   log_out_current_user,
} from "../../utils/helpers";

function AccountSettings({ current_user, history, dispatch }) {
   const [mode, set_mode] = useState("account-settings-menu");
   const [message_from_server, set_message_from_server] = useState("");
   const [current_password_error, set_current_password_error] = useState("");
   const [new_user_name_error, set_new_user_name_error] = useState("");
   const [new_email_error, set_new_email_error] = useState("");
   const [new_team_name_error, set_new_team_name_error] = useState("");
   const [new_initials_error, set_new_initials_error] = useState("");
   const [new_password_error, set_new_password_error] = useState("");

   useEffect(() => {
      // if there is not user logged in
      if (isEmpty(current_user)) {
         // send to landing page
         history.push("/");
      } else {
      }
   }, [current_user, history]);

   function clear_message_and_errors() {
      set_message_from_server("");
      set_mode(mode);
      set_current_password_error("");
      set_new_user_name_error("");
      set_new_email_error("");
      set_new_team_name_error("");
      set_new_initials_error("");
      set_new_password_error("");
   }

   const cancel_sub_menu = () => {
      set_message_from_server("");
      set_mode("account-settings-menu");
      set_current_password_error("");
      set_new_user_name_error("");
      set_new_email_error("");
      set_new_team_name_error("");
      set_new_initials_error("");
      set_new_password_error("");
   };

   const update_message_and_return = (new_message) => {
      set_message_from_server(new_message);
      set_mode("account-settings-menu");
      set_current_password_error("");
      set_new_user_name_error("");
      set_new_email_error("");
      set_new_team_name_error("");
      set_new_initials_error("");
      set_new_password_error("");
   };

   const enter_sub_menu = (sub_menu) => {
      set_message_from_server("");
      set_mode(sub_menu);
      set_current_password_error("");
      set_new_user_name_error("");
      set_new_email_error("");
      set_new_team_name_error("");
      set_new_initials_error("");
      set_new_password_error("");
   };

   // tests if the new user_name and password are valid and if so changes user_name
   async function validate_and_change_user_name(
      user_name_input,
      password_input
   ) {
      // create the object that will be the body that is sent
      const submission = {
         newUserName: user_name_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-user-name", submission)
         .then((res) => {
            const oldUserName = current_user.user_name; // storing old name so I can put it in the message
            // send the user with new name to Redux
            current_user.user_name = user_name_input;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: current_user,
            });

            // TODO: local token is not updated with the new user_name, but I don't think I am using that user_name for anything
            // if they refresh it will put the user_name from token in current_user

            update_message_and_return(
               `User name changed from "${oldUserName}" to "${user_name_input}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_new_user_name_error(data.new_user_name_error);
            set_current_password_error(data.current_password_error);
         });
   }

   // tests if the new email and password are valid and if so changes email
   async function validate_and_change_email(email_input, password_input) {
      console.log("current_user", current_user);
      // create the object that will be the body that is sent
      const submission = {
         new_email: email_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-email", submission)
         .then((res) => {
            const old_email = current_user.email; // storing old email so I can put it in the message
            // send the email with new name to Redux
            current_user.email = email_input;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: current_user,
            });

            // TODO: local token is not updated with the new email
            // if they refresh it will put the email from token in current_user

            update_message_and_return(
               `Email changed from "${old_email}" to "${email_input}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;

            // push errors or lack thereof to state
            set_new_email_error(data.new_email_error);
            set_current_password_error(data.current_password_error);
         });
   }

   // tests if the new initials and password are valid and if so changes initials
   async function validate_and_change_initials(initials_input, password_input) {
      // TODO: do not allow initials that are already in use

      // create the object that will be the body that is sent
      const submission = {
         newInitials: initials_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-initials", submission)
         .then((res) => {
            const oldInitials = current_user.initials; // storing old name so I can put it in the message
            // send the user with new name to Redux
            current_user.initials = initials_input;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: current_user,
            });

            // TODO: local token is not updated with the new initials, but I don't think I am using that initials for anything
            // if they refresh it will put the initials from token in current_user

            update_message_and_return(
               `User initials changed from "${oldInitials}" to "${initials_input}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_new_initials_error(data.new_initials_error);
            set_current_password_error(data.current_password_error);
         });
   }

   // tests if the new team name and password are valid and if so changes team name
   async function validate_and_change_team_name(
      team_name_input,
      password_input
   ) {
      // create the object that will be the body that is sent
      const submission = {
         newTeamName: team_name_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/set-team-name", submission)
         .then((res) => {
            const oldTeamName = current_user.team_name; // storing old name so I can put it in the message
            // send the user with new name to Redux
            current_user.team_name = team_name_input;
            dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: current_user,
            });

            // TODO: local token is not updated with the new team name, but I don't think I am using that team name for anything
            // if they refresh it will put the team name from token in current_user

            update_message_and_return(
               `Team name changed from "${oldTeamName}" to "${team_name_input}"`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // push errors or lack thereof to state
            set_new_team_name_error(data.new_team_name_error);
            set_current_password_error(data.current_password_error);
         });
   }

   // tests if the old password is valid and if so changes password to new one
   async function validate_and_change_password(
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
            update_message_and_return("Password changed.");

            // updateState(data); // the data received from server has the same keywords as state variables
         })
         .catch((err) => {
            const data = err.response.data;

            // push errors or lack thereof to state
            set_new_password_error(data.new_password_error);
            set_current_password_error(data.current_password_error);
         });
   }

   // tests if the password is valid and if so deletes the account
   async function validate_and_delete_account(currentPasswordInput) {
      // create the object that will be the body that is sent
      const submission = {
         currentPassword: currentPasswordInput, // send the plain text password over secure connection, the server will hash it
      };

      // post to API
      axios
         .put("api/v1/users/delete", submission)
         .then((res) => {
            clear_message_and_errors();
            set_message_from_server("This account has been deleted");
            set_mode("account-settings-menu");
            log_out_current_user();
            history.push("/");
         })
         .catch((err) => {
            const data = err.response.data;

            // push errors or lack thereof to state
            set_current_password_error(data.current_password_error);
         });
   }

   // abstract duplicated jsx
   function InputCurrentPassword() {
      return (
         <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            error_message={current_password_error}
         />
      );
   }

   function CancelButton() {
      return (
         <Button
            label="Cancel"
            secondary
            action={() => {
               cancel_sub_menu();
            }}
         />
      );
   }

   // renders the account settings menu buttons
   function render_account_settings_menu() {
      return (
         <>
            <Button
               label="Change Password..."
               primary
               block
               action={() => {
                  enter_sub_menu("change-password");
               }}
            />
            <Button
               label="Change User Name..."
               secondary
               block
               action={() => {
                  enter_sub_menu("change-user-name");
               }}
            />
            <Button
               label="Change Email..."
               secondary
               block
               action={() => {
                  enter_sub_menu("change-email");
               }}
            />
            <Button
               label="Change Team Name..."
               secondary
               block
               action={() => {
                  enter_sub_menu("change-team-name");
               }}
            />
            <Button
               label="Change Initials..."
               secondary
               block
               action={() => {
                  enter_sub_menu("change-initials");
               }}
            />
            <Button
               label="Delete Account..."
               secondary
               warning
               block
               action={() => {
                  enter_sub_menu("delete-account");
               }}
            />
            <Button
               label="Log out"
               secondary
               action={() => {
                  log_out_current_user();
                  history.push("/");
               }}
            />
         </>
      );
   }

   function render_change_user_name() {
      return (
         <>
            <h5>Change User Name</h5>
            <form>
               <Input
                  name="new-user-name"
                  label="New User Name"
                  placeholder={current_user.user_name}
                  max_length={MAX_USER_NAME_LENGTH}
                  error_message={new_user_name_error}
               />
               <InputCurrentPassword />
               <Button
                  label="Change User Name"
                  primary
                  block
                  action={() =>
                     validate_and_change_user_name(
                        document.getElementById("new-user-name-input").value,
                        document.getElementById("password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   function render_change_email() {
      return (
         <>
            <h5>Change Email Address</h5>
            <form>
               <Input
                  name="new-email"
                  label="New Email Address"
                  placeholder={current_user.email}
                  error_message={new_email_error}
                  max_length={MAX_EMAIL_LENGTH}
               />
               <InputCurrentPassword />
               <Button
                  label="Change Email"
                  primary
                  block
                  action={() =>
                     validate_and_change_email(
                        document.getElementById("new-email-input").value,
                        document.getElementById("password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   function render_change_initials() {
      return (
         <>
            <h5>Change Initials</h5>
            <form>
               <Input
                  name="new-initials"
                  label="New Initials"
                  placeholder={current_user.initials}
                  max_length={MAX_USER_INITIALS_LENGTH}
                  style={{ textTransform: "uppercase" }}
                  error_message={new_initials_error}
               />
               <InputCurrentPassword />
               <Button
                  label="Change Initials"
                  primary
                  block
                  action={() =>
                     validate_and_change_initials(
                        document
                           .getElementById("new-initials-input")
                           .value.toUpperCase(),
                        document.getElementById("password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   function render_change_team_name() {
      // TODO: do not allow a team name that is already in use
      return (
         <>
            <h5>Change Team Name</h5>
            <form>
               <Input
                  name="new-team-name"
                  label="New Team Name"
                  placeholder={current_user.team_name}
                  max_length={MAX_TEAM_NAME_LENGTH}
                  error_message={new_team_name_error}
               />
               <InputCurrentPassword />
               <Button
                  label="Change Team Name"
                  primary
                  block
                  action={() =>
                     validate_and_change_team_name(
                        document.getElementById("new-team-name-input").value,
                        document.getElementById("password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   function render_change_password() {
      return (
         <>
            <h5>Change Password</h5>
            <form>
               <Input
                  name="current-password"
                  label="Current Password"
                  type="password"
                  placeholder="Enter your existing password."
                  error_message={current_password_error}
               />
               <Input
                  name="new-password"
                  label="New Password"
                  type="password"
                  placeholder="Enter a new password"
                  error_message={new_password_error}
               />
               <Button
                  label="Change Password"
                  primary
                  block
                  action={() =>
                     validate_and_change_password(
                        document.getElementById("current-password-input").value,
                        document.getElementById("new-password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   function render_delete_account() {
      return (
         <>
            <h5>Delete Account</h5>
            <form>
               <InputCurrentPassword />
               <p>
                  Are you sure you want to delete account&nbsp;"
                  {current_user.user_name}"?
               </p>
               <Button
                  label="Delete Account"
                  danger
                  block
                  action={() =>
                     validate_and_delete_account(
                        document.getElementById("password-input").value
                     )
                  }
               />
               <CancelButton />
            </form>
         </>
      );
   }

   return (
      <>
         <NavBar />
         <div className="my-container">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     Account Settings
                     {/* &nbsp;for&nbsp;
                           {current_user.user_name} */}
                  </h2>
               </div>
               <div className="card-body">
                  {message_from_server && <p>{message_from_server}</p>}
                  {/* render component based on what mode we are in */}
                  {mode === "account-settings-menu" &&
                     render_account_settings_menu()}
                  {mode === "change-user-name" && render_change_user_name()}
                  {mode === "change-email" && render_change_email()}
                  {mode === "change-team-name" && render_change_team_name()}
                  {mode === "change-initials" && render_change_initials()}
                  {mode === "change-password" && render_change_password()}
                  {mode === "delete-account" && render_delete_account()}
               </div>
            </div>
         </div>
      </>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { current_user: state.current_user };
}

export default connect(mapStateToProps)(AccountSettings);
