import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import combineReducers from "./combineReducers";

const initialState = {
   currentUser: {},
   groupSeasonWeek: {},
   myPicks: [],
   groupPicks: {
      group_user_names: [],
      group_user_initials: [],
      match_ups: [],
      num_completed_games: 0,
   },
};

const store = createStore(combineReducers, initialState, composeWithDevTools());

export default store;
