import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import combineReducers from "./combineReducers";

const initialState = {
   currentUser: {},
   groupSeasonWeek: {
      group_id: "3fd8d78c-8151-4145-b276-aea3559deb76",
      season: 2020,
      week: 1,
   }, // default values go here so the first API call will get data for 2020 week 1
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
