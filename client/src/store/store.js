import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import combineReducers from "./combineReducers";

const initialState = {
   currentUser: {},
   groupSeasonWeek: {},
   myPicks: [],
   groupPicks: {
      teams: [],
      match_ups: [],
      num_completed_games: 0,
   },
   standings: [],
   message: {},
};

const store = createStore(combineReducers, initialState, composeWithDevTools());

export default store;
