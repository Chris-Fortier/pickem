import React from "react";

import "./style/master.scss";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import jwtDecode from "jwt-decode";
import store from "./store/store";
import actions from "./store/actions";
import axios from "axios";

import Landing from "./components/pages/Landing";
import AccountSettings from "./components/pages/AccountSettings";
import MyPicks from "./components/pages/MyPicks";
import GroupPicks from "./components/pages/GroupPicks";
import NotFound from "./components/pages/NotFound";

const authToken = localStorage.authToken; // get the auth token from local storage
if (authToken) {
   const currentTimeInSec = Date.now() / 1000;
   const user = jwtDecode(authToken);
   if (currentTimeInSec > user.exp) {
      console.log("expired token");

      // remove the currentUser from the global state / redux store
      store.dispatch({
         type: actions.UPDATE_CURRENT_USER,
         payload: {},
      });

      // remove the default headers
      delete axios.defaults.headers.common["x-auth-token"];
   } else {
      // authToken is not expired

      console.log("valid token");

      // store the user in global state / redux store (currentUser)
      store.dispatch({
         type: actions.UPDATE_CURRENT_USER,
         payload: user,
      });

      // set authorization headers for every request
      axios.defaults.headers.common["x-auth-token"] = authToken;

      // // redirect to default page if they are currently logged in, this is in an if statement so it won't keep refreshing forever
      // if (window.location.pathname === "/") {
      //    window.location.href = "/loadout-list"; // so if the user goes to our website with a valid token, they will go here
      //    // TODO, this needs to depend on the type of user
      // }
   }
} else {
   console.log("no token");

   // remove the default headers in the off chance they exist for some reason
   delete axios.defaults.headers.common["x-auth-token"];
}

function App() {
   return (
      <Router>
         <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/account-settings" component={AccountSettings} />
            <Route exact path="/my-picks" component={MyPicks} />
            <Route exact path="/group-picks" component={GroupPicks} />
            <Route component={NotFound} />
         </Switch>
      </Router>
   );
}

export default App;
