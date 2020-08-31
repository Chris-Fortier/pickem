import { combineReducers } from "redux";
import currentUser from "./reducers/currentUser";
import groupSeasonWeek from "./reducers/groupSeasonWeek";
import myPicks from "./reducers/myPicks";
import groupPicks from "./reducers/groupPicks";

export default combineReducers({
   currentUser,
   groupSeasonWeek,
   myPicks,
   groupPicks,
});
