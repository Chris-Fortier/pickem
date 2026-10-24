import React from "react";
import TEAM_NAMES from "../utils/TEAM_NAMES";
import classnames from "classnames";

// pick.pick is the pick to display, which may be a staged pick that hasn't been saved yet
export default function Pick({ pick, is_changed, on_pick }) {
   const is_pickable = pick.game_at > Date.now(); // whether or not you can pick this game (has server side check too)
   return (
      <div className={classnames("d-flex", { "pick-changed": is_changed })}>
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
                  on_pick(0);
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
                  on_pick(1);
               }
            }}
         >
            {TEAM_NAMES[pick.home_team]}
         </div>
      </div>
   );
}
