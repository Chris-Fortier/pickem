import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";
import uuid from "uuid";
import { get_week_or_season_text } from "../../utils/helpers";
import toDisplayDate from "date-fns/format";

function GroupPicks({ group_season_week, group_picks }) {
   return (
      <>
         <div className="my-table-container">
            <div className="lock-x-pos">
               <NavBar />
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
            <table className="table-dark table-striped">
               <tbody>
                  {/* each game of the week has one row */}
                  {group_picks.match_ups.map((match_up) => {
                     return (
                        <React.Fragment key={uuid.v4()}>
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
                                 {group_picks.teams.map((team) => {
                                    return (
                                       <th
                                          key={uuid.v4()}
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
                              {group_picks.teams.map((team) => {
                                 return (
                                    <td
                                       key={uuid.v4()}
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

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      group_season_week: state.group_season_week,
      group_picks: state.group_picks,
   };
}

export default connect(mapStateToProps)(GroupPicks);
