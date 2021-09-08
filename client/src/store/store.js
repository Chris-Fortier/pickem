import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import combine_reducers from "./combineReducers";

const initial_state = {
   current_user: {},
   group_season_week: {},
   my_picks: [],
   group_picks: {
      teams: [],
      match_ups: [],
      num_completed_games: 0,
   },
   standings: [],
   message: {},
};

const store = createStore(
   combine_reducers,
   initial_state,
   composeWithDevTools()
);

export default store;
