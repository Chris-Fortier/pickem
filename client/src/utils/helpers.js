// import bcrypt from "bcrypt";
import store from "../store/store";
import actions from "../store/actions";

// client-side constants
// const SALT_ROUNDS = 12;
export const MAX_USER_NAME_LENGTH = 24;
export const MAX_TEAM_NAME_LENGTH = 24;
export const MAX_USER_INITIALS_LENGTH = 3;
// export const TIME_UNTIL_WARNING_SHOWN = 2000; // ms until the warning message pops up
// export const TIME_UNTIL_SUCCESS_HIDDEN = 2000; // ms until a success message disappears

// // returns a hashed version of a given password
// export function toHash(myPlaintextPassword) {
//    return bcrypt.hash(myPlaintextPassword, SALT_ROUNDS);
// }

export function logOutCurrentUser() {
   // clear reducers from Redux
   console.log("log out");
   store.dispatch({
      type: actions.UPDATE_CURRENT_USER,
      payload: {}, // empty user object
   });
   store.dispatch({
      type: actions.SET_GROUP_SEASON_WEEK,
      payload: {}, // empty
   });
   store.dispatch({
      type: actions.STORE_MY_PICKS,
      payload: [], // empty
   });
   // this one needs empty properties to render group-picks properly
   store.dispatch({
      type: actions.STORE_GROUP_PICKS,
      payload: {
         teams: [],
         match_ups: [],
         num_completed_games: 0,
      }, // empty
   });
   store.dispatch({
      type: actions.STORE_STANDINGS,
      payload: [], // empty
   });
   store.dispatch({
      type: actions.CLEAR_MESSAGE,
   });
}

// input a week number or '%' and return 'Week X' or 'Season'
export function get_week_or_season_text(week) {
   let text = `Week ${week}`;
   if (week === "%") {
      text = "Season";
   } else if (week === 18) {
      text = "Wildcard Round";
   } else if (week === 19) {
      text = "Divisional Round";
   } else if (week === 20) {
      text = "Conference Championships";
   } else if (week === 21) {
      text = "The Big Game";
   }
   return text;
}
