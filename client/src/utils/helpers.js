// import bcrypt from "bcrypt";
import store from "../store/store";
import actions from "../store/actions";

// client-side constants
// const SALT_ROUNDS = 12;
export const MAX_USER_NAME_LENGTH = 24;
export const MAX_USER_INITIALS_LENGTH = 3;

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
         group_user_names: [],
         group_user_initials: [],
         match_ups: [],
         num_completed_games: 0,
      }, // empty
   });
}
