import React from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import TEAM_NAMES from "../../utils/TEAM_NAMES";
import classnames from "classnames";
import axios from "axios";

function Pick({ my_picks, pick, dispatch }) {
   // only allow changing of pick if game has not stated yet (has server side check too)
   function upsert_pick(game_id, group_id, pick_choice) {
      // get the previous pick value
      const prev_pick = pick.pick;

      // if the previous pick is the same as the desired pick, change the new pick to be null (to "cancel" the pick)
      if (prev_pick === pick_choice) {
         pick_choice = null;
      }

      // immediately update Redux for best responsiveness
      pick.pick = pick_choice;
      dispatch({
         type: actions.STORE_MY_PICKS,
         payload: [...my_picks],
      });

      // post a message about waiting for server response
      dispatch({
         type: actions.STORE_WARNING_MESSAGE,
         payload: "Sending pick to the server...",
      });

      // get my picks from the API
      axios
         .put(
            `/api/v1/picks?game_id=${game_id}&group_id=${group_id}&pick=${pick_choice}`
         )
         .then((res) => {
            // the pick was already updated above

            // post a response message
            dispatch({
               type: actions.STORE_SUCCESS_MESSAGE,
               payload: "Pick updated.",
            });
         })
         .catch((err) => {
            console.log(err.response);
            // if there was a server error, change the pick back on the client to the previous value
            pick.pick = prev_pick;
            dispatch({
               type: actions.STORE_MY_PICKS,
               payload: [...my_picks],
            });

            // post an error message
            dispatch({
               type: actions.STORE_DANGER_MESSAGE,
               payload:
                  "Could not send your pick. You might have a connection issue or the server needs to wake up. Try again in a few moments.",
            });
         });
   }

   const is_pickable = pick.game_at > Date.now(); // whether or not you can pick this game
   return (
      <div className="d-flex">
         <div
            className={classnames({
               "team-choice right": true,
               "team-choice-picked": pick.pick === 0,
               "team-choice-winner": pick.winner === 0 && pick.pick === 0,
               "team-choice-loser": pick.winner === 0 && pick.pick === 1,
               pickable: is_pickable,
               started: !is_pickable,
            })}
            onClick={() => {
               if (is_pickable) {
                  upsert_pick(pick.game_id, pick.group_id, 0);
               }
            }}
         >
            {TEAM_NAMES[pick.away_team]}
         </div>
         &nbsp;@&nbsp;
         <div
            className={classnames({
               "team-choice": true,
               "team-choice-picked": pick.pick === 1,
               "team-choice-winner": pick.winner === 1 && pick.pick === 1,
               "team-choice-loser": pick.winner === 1 && pick.pick === 0,
               pickable: is_pickable,
               started: !is_pickable,
            })}
            onClick={() => {
               if (is_pickable) {
                  upsert_pick(pick.game_id, pick.group_id, 1);
               }
            }}
         >
            {TEAM_NAMES[pick.home_team]}
         </div>
      </div>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { my_picks: state.my_picks };
}

export default connect(mapStateToProps)(Pick);
