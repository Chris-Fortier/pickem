import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";
import { get_week_or_season_text } from "../../utils/helpers";
import toDisplayDate from "date-fns/format";

function GroupPicks({ groupSeasonWeek, groupPicks }) {
   return (
      <>
         <div className="my-table-container">
            <div className="lock-x-pos">
               <NavBar />
               <div className="card card-header">
                  <h2>
                     Group Picks For&nbsp;{groupSeasonWeek.season}
                     &nbsp;
                     {get_week_or_season_text(
                        groupSeasonWeek.week,
                        groupSeasonWeek.season
                     )}
                  </h2>
               </div>
            </div>
            <table className="table-dark table-striped">
               <tbody>
                  {/* each game of the week has one row */}
                  {groupPicks.match_ups.map((match_up) => {
                     return (
                        <>
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
                                 {groupPicks.teams.map((team) => {
                                    return (
                                       <th
                                          scope="col"
                                          style={{ textAlign: "center" }}
                                          className="top-row"
                                       >
                                          {team.initials.toUpperCase()}
                                       </th>
                                    );
                                 })}
                              </tr>
                           )}
                           <tr>
                              <th scope="row" className="left-column">
                                 {match_up.title}
                              </th>
                              {groupPicks.teams.map((team) => {
                                 return (
                                    <td
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
                        </>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      groupSeasonWeek: state.groupSeasonWeek,
      groupPicks: state.groupPicks,
   };
}

export default connect(mapStateToProps)(GroupPicks);
