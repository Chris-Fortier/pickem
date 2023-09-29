import React, { useState, useEffect } from "react";
import axios from "axios";
import classnames from "classnames";
import { get_week_or_season_text } from "../utils/client_helpers";
import { v4 } from "uuid";

const MEDALS = [
   { user_id: "ba1c83b1-9899-42e0-97f3-561f0643153a", label: "20" },
   { user_id: "23e3a0cc-588a-4a91-8709-0be31c89ce6e", label: "21" },
   { user_id: "8cb742cb-d04c-4714-b11a-a4ca54d7fd30", label: "22" },
];

export default function Standings({
   group_season_week,
   user,
   set_warning_message,
   clear_message,
   set_danger_message,
}) {
   // TODO: call api to get standings
   const [standings, set_standings] = useState([]);

   useEffect(() => {
      if (user) {
         // get the group picks
         set_warning_message(
            "Getting data from the server... If this takes awhile the server might be waking up."
         );
         axios
            .get(
               `/api/standings?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               set_standings(res.data);
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
         {/* <NavBar /> */}
         <div className="my-container bottom-scroll-fix">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     {group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                     <br />
                     Standings
                  </h2>
                  {group_season_week.week !== "all" && (
                     <p>
                        These are standings for week {group_season_week.week}{" "}
                        only. To see the standings for the entire season, choose
                        &quot;Entire Season&quot; in the week selector.
                     </p>
                  )}
               </div>
               <div className="card-body">
                  <table style={{ width: "100%" }}>
                     <tbody>
                        <tr>
                           {/* <th>Rank</th> */}
                           <th>Rk</th>
                           <th>Team</th>
                           <th>Abbr</th>
                           <th style={{ textAlign: "right" }}>
                              {group_season_week.season <= 2020 ? "CP" : "Pts"}
                           </th>
                           <th style={{ textAlign: "right" }}>PB</th>
                        </tr>
                        {standings.map((standings_item) => {
                           const initials =
                              standings_item.initials.toUpperCase();
                           return (
                              <tr
                                 key={v4()}
                                 className={classnames({
                                    "new-standings-rank":
                                       standings_item.is_new_rank,
                                    "this-user-standings":
                                       user.team_name ===
                                       standings_item.team_name,
                                 })}
                              >
                                 <td>{standings_item.rank}</td>
                                 <td>
                                    {standings_item.team_name}
                                    {/* TODO: need a better way to determine medals than hard-coding */}
                                    {MEDALS.filter((medal) => {
                                       return (
                                          medal.user_id ===
                                          standings_item.user_id
                                       );
                                    }).map((medal) => {
                                       return (
                                          <span className="medal" key={v4()}>
                                             {medal.label}
                                          </span>
                                       );
                                    })}
                                 </td>
                                 <td>{initials}</td>
                                 <td style={{ textAlign: "right" }}>
                                    {group_season_week.season <= 2020
                                       ? standings_item.num_correct
                                       : standings_item.num_points}
                                 </td>
                                 <td style={{ textAlign: "right" }}>
                                    {group_season_week.season <= 2020
                                       ? standings_item.num_behind
                                       : standings_item.num_points_behind}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
               <div className="card-footer">
                  {group_season_week.season <= 2020 && (
                     <p>CP = Correct Picks</p>
                  )}{" "}
                  {(group_season_week.season === 2021 ||
                     group_season_week.season === 2022) && (
                     <p>
                        Pts = Points. In the 2021 and 2022 seasons, regular
                        season correct picks were worth 1 point each, wild-card
                        round 2 points, divisional 4 points, conference
                        championship 8 points and the big game 16 points.
                     </p>
                  )}
                  {group_season_week.season >= 2023 && (
                     <p>
                        Pts = Points. As of the 2023 season, regular season
                        correct picks are worth 1 point each, wild-card and
                        divisional round 2 points, conference championship 4
                        points and the big game 8 points.
                     </p>
                  )}
                  <p>
                     PB = how many{" "}
                     {group_season_week.season <= 2020 ? "picks" : "points"}{" "}
                     this player is behind the leader.
                  </p>
               </div>
            </div>
         </div>
      </>
   );
}
