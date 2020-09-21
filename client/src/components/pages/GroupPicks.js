import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";

class GroupPicks extends React.Component {
   render() {
      return (
         <>
            <div className="my-table-container">
               <div className="lock-x-pos">
                  <NavBar parentProps={this.props} />
                  <div className="card card-header">
                     <h2>
                        Group Picks For Week {this.props.groupSeasonWeek.week}
                     </h2>
                  </div>
               </div>
               <table className="table-dark table-striped">
                  <thead>
                     <tr>
                        <th scope="col">Game</th>
                        {/* list the user names across the top of the table */}
                        {this.props.groupPicks.teams.map((team) => {
                           return (
                              <th scope="col" style={{ textAlign: "center" }}>
                                 {team.initials.toUpperCase()}
                              </th>
                           );
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {/* each game of the week has one row */}
                     {this.props.groupPicks.match_ups.map((match_up) => {
                        return (
                           <tr>
                              <th scope="row">{match_up.title}</th>
                              {this.props.groupPicks.teams.map((team) => {
                                 return (
                                    <td
                                       className={classnames({
                                          "locked-pick-group":
                                             match_up.game_at < Date.now(),
                                          "correct-pick-group":
                                             match_up.picks[team.user_id]
                                                .pick_result === true,
                                          "incorrect-pick-group":
                                             match_up.picks[team.user_id]
                                                .pick_result === false,
                                       })}
                                       style={{ "text-align": "center" }}
                                    >
                                       {match_up.picks[team.user_id].pick_label}
                                    </td>
                                 );
                              })}
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      currentUser: state.currentUser,
      groupSeasonWeek: state.groupSeasonWeek,
      groupPicks: state.groupPicks,
   };
}

export default connect(mapStateToProps)(GroupPicks);
