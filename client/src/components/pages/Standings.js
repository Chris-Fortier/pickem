import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";
import { get_week_or_season_text } from "../../utils/helpers";
import Medal2020 from "../svg/Medal2020";
import uuid from "uuid";

function Standings({ group_season_week, standings, current_user }) {
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
                           <th style={{ textAlign: "right" }}>CP</th>
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
                                    {user.team_name ===
                                       "Andrew Luck’s Neckbeard" && (
                                       <>
                                          {" "}
                                          <span>
                                             <Medal2020
                                                style={{
                                                   width: "20px",
                                                   height: "20px",
                                                   position: "relative",
                                                   top: "-2px",
                                                }}
                                             />
                                          </span>
                                       </>
                                    )}
                                 </td>
                                 <td>{initials}</td>
                                 <td style={{ textAlign: "right" }}>
                                    {user.num_correct}
                                 </td>
                                 <td style={{ textAlign: "right" }}>
                                    {user.num_behind}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
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
