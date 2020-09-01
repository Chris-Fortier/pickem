import { combineReducers } from "redux";
import currentUser from "./reducers/currentUser";
import groupSeasonWeek from "./reducers/groupSeasonWeek";
import myPicks from "./reducers/myPicks";
import groupPicks from "./reducers/groupPicks";
import standings from "./reducers/standings";

export default combineReducers({
   currentUser,
   groupSeasonWeek,
   myPicks,
   groupPicks,
   standings,
});
