import { combineReducers } from "redux";
import currentUser from "./reducers/currentUser";
import myPicks from "./reducers/myPicks";

export default combineReducers({
   currentUser,
   myPicks,
});
