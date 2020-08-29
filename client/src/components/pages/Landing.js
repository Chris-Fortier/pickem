import React from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
import jwtDecode from "jwt-decode";

class Landing extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor

      this.state = {
         mode: "log-in", // dictates what is rendered

         // errors
         newUserNameError: "",
         newPasswordError: "",
         currentUserNameError: "",
         currentPasswordError: "",
      };
   }

   clearErrors() {
      this.setState({
         newUserNameError: "",
         newPasswordError: "",
         currentUserNameError: "",
         currentPasswordError: "",
      });
   }

   // sends an API call to make a new user and if successful, pushes to new page depending on the type of user
   // works with any user type
   postNewUserAndPush(user) {
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
            this.props.dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: user,
            });

            // set authorization headers for every request at the moment of log in
            axios.defaults.headers.common["x-auth-token"] = authToken;

            // go to home page
            this.props.history.push("/account-settings");
            window.scrollTo(0, 0); // sets focus to the top of the page
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);
            const { newUserNameError, newPasswordError } = data;

            // push errors or lack thereof to state
            this.setState({
               newUserNameError,
               newPasswordError,
            });
         });
   }

   // tests if the user_name and password are valid and if so creates the user
   async validateAndCreateUser(userNameInput, passwordInput) {
      // create user obj
      const user = {
         user_name: userNameInput,
         password: passwordInput, // send the plain text password over secure connection, the server will hash it
      };

      this.postNewUserAndPush(user);
   }

   // tests if the user_name and password are valid and if so logs in
   // works with any user type
   async validateAndLogInUser(userNameInput, passwordInput) {
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
            console.log("authToken", authToken);

            const user = jwtDecode(authToken); // decode the user from the access token

            // send the user to Redux
            this.props.dispatch({
               type: actions.UPDATE_CURRENT_USER,
               payload: user,
            });

            // set authorization headers for every request at the moment of log in
            axios.defaults.headers.common["x-auth-token"] = authToken;

            // go to home page
            this.props.history.push("/account-settings");
            window.scrollTo(0, 0); // sets focus to the top of the page
         })
         .catch((err) => {
            console.log("err", err);
            const { data } = err.response;
            console.log("data", data);
            const { currentUserNameError, currentPasswordError } = data;

            // push errors or lack thereof to state
            this.setState({
               currentUserNameError,
               currentPasswordError,
            });
         });
   }

   renderLogin() {
      return (
         <div className="card">
            <div className="card-header">Log In</div>
            <div className="card-body">
               <form>
                  <div className="form-group">
                     <label htmlFor="user-name-input">User Name</label>
                     <input
                        type="text"
                        className="form-control"
                        id="user-name-input"
                        placeholder="Enter your user name"
                     />
                     {this.state.currentUserNameError && (
                        <div className="text-danger">
                           {this.state.currentUserNameError}
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
                     type="submit"
                     className="btn btn-primary btn-block"
                     onClick={() =>
                        this.validateAndLogInUser(
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
                        this.clearErrors();
                        this.setState({ mode: "sign-up" });
                     }}
                  >
                     Make a new account
                  </div>
               </form>
            </div>
         </div>
      );
   }

   renderSignup() {
      return (
         <div className="card">
            <div className="card-header">Sign Up</div>
            <div className="card-body">
               <form>
                  <div className="form-group">
                     <label htmlFor="user-name-input">User Name</label>
                     <input
                        type="text"
                        className="form-control"
                        id="user-name-input"
                        placeholder="Enter a new user name"
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
                        placeholder="Enter a password"
                     />
                     {this.state.newPasswordError && (
                        <div className="text-danger">
                           {this.state.newPasswordError}
                        </div>
                     )}
                  </div>
                  <div
                     type="submit"
                     className="btn btn-primary btn-block"
                     onClick={() =>
                        this.validateAndCreateUser(
                           document.getElementById("user-name-input").value,
                           document.getElementById("password-input").value
                        )
                     }
                  >
                     Sign up
                  </div>
                  <div
                     className="btn btn-secondary mt-3"
                     onClick={() => {
                        this.clearErrors();
                        this.setState({ mode: "log-in" });
                     }}
                  >
                     Use an existing account
                  </div>
               </form>
            </div>
         </div>
      );
   }

   render() {
      return (
         <div className="container">
            <div className="row">
               <div className="col col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                  <h1>Hawk Nation NFL Pick 'em</h1>
                  {/* render component based on what mode we are in */}
                  {this.state.mode === "log-in" && this.renderLogin()}
                  {this.state.mode === "sign-up" && this.renderSignup()}
               </div>
            </div>
         </div>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {};
}

export default connect(mapStateToProps)(Landing);
