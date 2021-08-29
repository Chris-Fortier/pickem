import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";
import { get_week_or_season_text } from "../../utils/helpers";
import Medal2020 from "../svg/Medal2020";
import uuid from "uuid";

function Standings({ groupSeasonWeek, standings, currentUser }) {
   return (
      <>
         <NavBar />
         <div className="container">
            <div className="row">
               <div className="col col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                  <div className="card mt-5 mb-5">
                     <div className="card-header">
                        <h2>
                           {groupSeasonWeek.season}
                           &nbsp;
                           {get_week_or_season_text(
                              groupSeasonWeek.week,
                              groupSeasonWeek.season
                           )}
                           <br />
                           Standings
                        </h2>
                        {groupSeasonWeek.week !== "%" && (
                           <p>
                              These are standings for week{" "}
                              {groupSeasonWeek.week} only. To see the standings
                              for the entire season, choose "Season" in the week
                              dropdown.
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
                                          "new-standings-rank":
                                             user.is_new_rank,
                                          "this-user-standings":
                                             user.team_name ===
                                             currentUser.team_name,
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
            </div>
         </div>
      </>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      groupSeasonWeek: state.groupSeasonWeek,
      standings: state.standings,
      currentUser: state.currentUser,
   };
}

export default connect(mapStateToProps)(Standings);
