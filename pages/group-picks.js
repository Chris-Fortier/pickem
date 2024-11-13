import React, { useEffect, useState } from "react";
import axios from "axios";
import classnames from "classnames";
import { v4 } from "uuid";
import { get_week_or_season_text } from "../utils/client_helpers";
import toDisplayDate from "date-fns/format";

export default function GroupPicks({
   group_season_week,
   set_danger_message,
   set_warning_message,
   clear_message,
   user,
}) {
   const [teams, set_teams] = useState([]);
   const [match_ups, set_match_ups] = useState([]);

   useEffect(() => {
      if (user?.id) {
         // note: just checking for user doesn't work because {} is true
         set_teams([]); // seem to need to clear the teams first due to it rendering columns for teams that haven't participated for one frame
         // get the group picks
         set_warning_message(
            "Getting data from the server... If this takes awhile the server might be waking up."
         );
         axios
            .get(
               `/api/group-week-picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               set_match_ups(res.data.match_ups);
               set_teams(res.data.teams);
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
         <div className="my-table-container">
            <div className="lock-x-pos">
               {/* <NavBar /> */}
               <div className="card card-header">
                  <h2>
                     Group Picks For&nbsp;{group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                  </h2>
               </div>
            </div>
            <table className="table-dark table-striped bottom-scroll-fix">
               <tbody>
                  {/* each game of the week has one row */}
                  {match_ups.map((match_up) => {
                     return (
                        <React.Fragment key={v4()}>
                           {/* each new date has a row divider */}
                           {match_up.is_new_date && (
                              <tr>
                                 <th
                                    scope="row"
                                    className="left-column top-row date"
                                 >
                                    {toDisplayDate(
                                       match_up.game_at,
                                       "EE MM/dd"
                                    )}
                                 </th>
                                 {teams.map((team, i) => {
                                    return (
                                       <th
                                          key={v4()}
                                          scope="col"
                                          style={{ textAlign: "center" }}
                                          className="top-row"
                                       >
                                          {i === 0
                                             ? user.initials.toUpperCase() // use the user's initials for the first column
                                             : team.initials.toUpperCase()}
                                       </th>
                                    );
                                 })}
                              </tr>
                           )}
                           <tr>
                              <th scope="row" className="left-column">
                                 {match_up.title}
                              </th>
                              {teams.map((team) => {
                                 return (
                                    <td
                                       key={v4()}
                                       className={classnames({
                                          "pregame-pick-group": true,
                                          "locked-pick-group":
                                             match_up.game_at < Date.now(),
                                          "correct-pick-group":
                                             match_up.picks[team.user_id]
                                                .pick_result === true,
                                          "incorrect-pick-group":
                                             match_up.picks[team.user_id]
                                                .pick_result === false,
                                       })}
                                       style={{ textAlign: "center" }}
                                    >
                                       {match_up.picks[team.user_id].pick_label}
                                    </td>
                                 );
                              })}
                           </tr>
                        </React.Fragment>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </>
   );
}
