import { combineReducers } from "redux";
import current_user from "./reducers/currentUser";
import group_season_week from "./reducers/groupSeasonWeek";
import my_picks from "./reducers/myPicks";
import group_picks from "./reducers/groupPicks";
import standings from "./reducers/standings";
import message from "./reducers/message";

export default combineReducers({
   current_user,
   group_season_week,
   my_picks,
   group_picks,
   standings,
   message,
});
