import { combineReducers } from "redux";
import current_user from "./reducers/current_user";
import group_season_week from "./reducers/group_season_week";
import my_picks from "./reducers/my_picks";
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
