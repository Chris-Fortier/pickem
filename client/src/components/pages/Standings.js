import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";
import { get_week_or_season_text } from "../../utils/helpers";
import uuid from "uuid";

const MEDALS = [
   { user_id: "ba1c83b1-9899-42e0-97f3-561f0643153a", label: "20" },
   { user_id: "23e3a0cc-588a-4a91-8709-0be31c89ce6e", label: "21" },
];

function Standings({ group_season_week, standings, current_user }) {
   console.log(standings);
   return (
      <>
         <NavBar />
         <div className="my-container">
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
                  {group_season_week.week !== "%" && (
                     <p>
                        These are standings for week {group_season_week.week}{" "}
                        only. To see the standings for the entire season, choose
                        "Entire Season" in the week selector.
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
                        {standings.map((user) => {
                           const initials = user.initials.toUpperCase();
                           return (
                              <tr
                                 key={uuid.v4()}
                                 className={classnames({
                                    "new-standings-rank": user.is_new_rank,
                                    "this-user-standings":
                                       user.team_name ===
                                       current_user.team_name,
                                 })}
                              >
                                 <td>{user.rank}</td>
                                 <td>
                                    {user.team_name}
                                    {/* TODO: need a better way to determine medals than hard-coding */}
                                    {MEDALS.filter((medal) => {
                                       return medal.user_id === user.user_id;
                                    }).map((medal) => {
                                       return (
                                          <span
                                             className="medal"
                                             key={uuid.v4()}
                                          >
                                             {medal.label}
                                          </span>
                                       );
                                    })}
                                 </td>
                                 <td>{initials}</td>
                                 <td style={{ textAlign: "right" }}>
                                    {group_season_week.season <= 2020
                                       ? user.num_correct
                                       : user.num_points}
                                 </td>
                                 <td style={{ textAlign: "right" }}>
                                    {group_season_week.season <= 2020
                                       ? user.num_behind
                                       : user.num_points_behind}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
               <div className="card-footer">
                  {group_season_week.season <= 2020 ? (
                     <p>CP = Correct Picks</p>
                  ) : (
                     <p>
                        Pts = Points. As of the 2021 season, regular season
                        correct picks are worth 1 point each, wild-card round 2
                        points, divisional 4 points, conference championship 8
                        points and the big game 16 points.
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

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      group_season_week: state.group_season_week,
      standings: state.standings,
      current_user: state.current_user,
   };
}

export default connect(mapStateToProps)(Standings);
