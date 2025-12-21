import React, { useState, useEffect } from "react";
import axios from "axios";
import classnames from "classnames";
import { v4 } from "uuid";

const MEDALS = [
   { user_id: "ba1c83b1-9899-42e0-97f3-561f0643153a", label: "20" },
   { user_id: "23e3a0cc-588a-4a91-8709-0be31c89ce6e", label: "21" },
   { user_id: "8cb742cb-d04c-4714-b11a-a4ca54d7fd30", label: "22" },
   { user_id: "8cb742cb-d04c-4714-b11a-a4ca54d7fd30", label: "23" },
   { user_id: "23e3a0cc-588a-4a91-8709-0be31c89ce6e", label: "24" },
];

const StandingsCard = ({ standings, season, week, is_loading, user }) => {
   return (
      <div className="my-card">
         <div className="card-header">
            <h2>
               {week === "all"
                  ? `${season} Season Standings`
                  : `${season} Week ${week} Results`}
            </h2>
            {!is_loading && week !== "all" && (
               <p>
                  These are standings for week {week} only. See the standings
                  for the entire season below.
               </p>
            )}
         </div>
         <div className="card-body">
            {is_loading ? (
               <p>Loading...</p>
            ) : (
               <table style={{ width: "100%" }}>
                  <tbody>
                     <tr>
                        {/* <th>Rank</th> */}
                        <th>Rk</th>
                        <th>Team</th>
                        <th>Abbr</th>
                        <th style={{ textAlign: "right" }}>
                           {season <= 2020 ? "CP" : "Pts"}
                        </th>
                        <th style={{ textAlign: "right" }}>PB</th>
                     </tr>
                     {standings.map((standings_item) => {
                        const initials = standings_item.initials.toUpperCase();
                        return (
                           <tr
                              key={v4()}
                              className={classnames({
                                 "new-standings-rank":
                                    standings_item.is_new_rank,
                                 "this-user-standings":
                                    user.team_name === standings_item.team_name,
                              })}
                           >
                              <td>{standings_item.rank}</td>
                              <td>
                                 {standings_item.team_name}
                                 {/* TODO: need a better way to determine medals than hard-coding */}
                                 {MEDALS.filter((medal) => {
                                    return (
                                       medal.user_id === standings_item.user_id
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
                                 {season <= 2020
                                    ? standings_item.num_correct
                                    : standings_item.num_points}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                 {season <= 2020
                                    ? standings_item.num_behind
                                    : standings_item.num_points_behind}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>
      </div>
   );
};

export default function Standings({
   group_season_week,
   user,
   set_warning_message,
   clear_message,
   set_danger_message,
}) {
   const [standings_season, set_standings_season] = useState([]);
   const [standings_week, set_standings_week] = useState([]);
   const [is_loading, set_is_loading] = useState(true);

   const get_standings = (set_standings, week) => {
      if (user) {
         set_standings([]); // clear the shown standings until new ones load
         set_is_loading(true);
         // get the group picks
         set_warning_message(
            "Getting data from the server... If this takes awhile the server might be waking up."
         );
         axios
            .get(
               `/api/standings?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${week}`
            )
            .then((res) => {
               set_standings(res.data);
               clear_message();
               set_is_loading(false);
            })
            .catch((err) => {
               console.log("err", err);
               set_danger_message(
                  "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments."
               );
            });
      }
   };

   useEffect(() => {
      get_standings(set_standings_season, "all"); // get standings for season
      get_standings(set_standings_week, group_season_week.week); // get standings for week
   }, [group_season_week, user]);

   return (
      <>
         {/* <NavBar /> */}
         <div className="my-container bottom-scroll-fix">
            <StandingsCard
               standings={standings_week}
               season={group_season_week.season}
               week={group_season_week.week}
               is_loading={is_loading}
               user={user}
            />
            <StandingsCard
               standings={standings_season}
               season={group_season_week.season}
               week={"all"}
               is_loading={is_loading}
               user={user}
            />
            {!is_loading && (
               <div className="my-card">
                  <div className="card-body">
                     {group_season_week.season <= 2020 && (
                        <p>CP = Correct Picks</p>
                     )}{" "}
                     {(group_season_week.season === 2021 ||
                        group_season_week.season === 2022) && (
                        <p>
                           Pts = Points. In the 2021 and 2022 seasons, regular
                           season correct picks were worth 1 point each,
                           wild-card round 2 points, divisional 4 points,
                           conference championship 8 points and the big game 16
                           points.
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
            )}
         </div>
      </>
   );
}
