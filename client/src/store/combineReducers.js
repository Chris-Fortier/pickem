import { combineReducers } from "redux";
import currentUser from "./reducers/currentUser";
import groupSeasonWeek from "./reducers/groupSeasonWeek";
import myPicks from "./reducers/myPicks";
import groupPicks from "./reducers/groupPicks";
import standings from "./reducers/standings";
import message from "./reducers/message";

export default combineReducers({
   currentUser,
   groupSeasonWeek,
   myPicks,
   groupPicks,
   standings,
   message,
});
