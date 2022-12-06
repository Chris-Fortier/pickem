import React, { useEffect, useState } from "react";
import axios from "axios";
import toDisplayDate from "date-fns/format";
import Pick from "../components/Pick";
// import isEmpty from "lodash/isEmpty";
import { get_week_or_season_text } from "../utils/client_helpers";
import { v4 } from "uuid";

export default function MyPicks({
   group_season_week,
   user,
   set_warning_message,
   clear_message,
   set_success_message,
   set_danger_message,
}) {
   let rolling_date = 0; // for keeping track when a game is on a new date
   let is_rendering_date = true;
   let is_rendering_time = true;

   const [my_picks, set_my_picks] = useState([]); // TODO: use api to get my picks

   useEffect(() => {
      if (user) {
         // get the group picks
         set_warning_message(
            "Getting data from the server... If this takes awhile the server might be waking up."
         );
         axios
            .get(
               `/api/picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               set_my_picks(res.data);
               clear_message();
            })
            .catch((err) => {
               console.log("err", err);
               set_danger_message(
                  "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments."
               );
            });
      }
   }, [group_season_week, user]);

   return (
      <>
         <div className="my-container bottom-scroll-fix">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     My Picks For&nbsp;
                     {group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                  </h2>
               </div>
               <div className="card-body">
                  <p>
                     Each pick is saved as soon as it is selected. You can
                     change your pick for a game as many times as you want until
                     the game starts.
                  </p>
                  {my_picks.map((pick) => {
                     if (pick.game_at > rolling_date + 43200000) {
                        is_rendering_date = true;
                        is_rendering_time = true;
                     } else if (pick.game_at > rolling_date) {
                        is_rendering_date = false;
                        is_rendering_time = true;
                     } else {
                        is_rendering_date = false;
                        is_rendering_time = false;
                     }
                     rolling_date = pick.game_at;
                     return (
                        <span key={v4()}>
                           {is_rendering_time && <br />}
                           {is_rendering_date && (
                              <h5 align="center">
                                 {toDisplayDate(pick.game_at, "EEE MMM dd")}
                              </h5>
                           )}
                           {is_rendering_time && (
                              <h6 align="center">
                                 {toDisplayDate(pick.game_at, "p")}
                              </h6>
                           )}
                           <Pick
                              pick={pick}
                              my_picks={my_picks}
                              set_my_picks={set_my_picks}
                              set_warning_message={set_warning_message}
                              set_success_message={set_success_message}
                              set_danger_message={set_danger_message}
                              group_id={group_season_week.group_id}
                           />
                        </span>
                     );
                  })}
               </div>
            </div>
         </div>
      </>
   );
}
