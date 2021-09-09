import actions from "../actions";
import isEmpty from "lodash/isEmpty";
import axios from "axios";

export default function current_user(current_user = {}, action) {
   // default for state is an empty object

   // let newCurrentUser = { ...current_user }; // make a copy of it as we cannot change the original one in place

   switch (action.type) {
      case actions.UPDATE_CURRENT_USER:
         // remove the auth token when they log out
         if (isEmpty(action.payload)) {
            localStorage.removeItem("authToken");

            // remove the default headers
            delete axios.defaults.headers.common["x-auth-token"];
            console.log("remove the user token");
         }
         return action.payload; // if its empty or not, return it to the redux store
      default:
         return current_user;
   }
}
