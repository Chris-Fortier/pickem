import React from "react";
import TEAM_NAMES from "../utils/TEAM_NAMES";
import classnames from "classnames";
import axios from "axios";

export default function Pick({
   my_picks,
   pick,
   set_my_picks,
   set_warning_message,
   set_success_message,
   set_danger_message,
   group_id,
}) {
   // only allow changing of pick if game has not stated yet (has server side check too)
   function upsert_pick(game_id, pick_choice) {
      // get the previous pick value
      const prev_pick = pick.pick;

      // if the previous pick is the same as the desired pick, change the new pick to be null (to "cancel" the pick)
      if (prev_pick === pick_choice) {
         pick_choice = null;
      }

      // immediately update Redux for best responsiveness
      pick.pick = pick_choice;
      set_my_picks([...my_picks]);

      // post a message about waiting for server response
      set_warning_message("Sending pick to the server...");

      // send pick to the api
      axios
         .put(
            `/api/picks?game_id=${game_id}&group_id=${group_id}&pick=${pick_choice}`
         )
         .then(() => {
            // the local pick was already updated above

            // post a response message
            set_success_message("Pick updated.");
         })
         .catch((err) => {
            console.log("error!", err, err.response);
            // if there was a server error, change the pick back on the client to the previous value
            pick.pick = prev_pick;
            set_my_picks([...my_picks]);

            // post an error message
            set_danger_message(
               "Could not send your pick. You might have a connection issue or the server needs to wake up. Try again in a few moments."
            );
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
                  upsert_pick(pick.game_id, 0);
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
                  upsert_pick(pick.game_id, 1);
               }
            }}
         >
            {TEAM_NAMES[pick.home_team]}
         </div>
      </div>
   );
}
