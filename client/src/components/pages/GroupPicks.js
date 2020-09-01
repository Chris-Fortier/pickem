import React from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import classnames from "classnames";

class GroupPicks extends React.Component {
   render() {
      return (
         <>
            {/* <NavBar /> */}
            {/* <div className="container">
               <div className="row">
                  <div className="col-12">
                     <div className="card mt-5 mb-5">
                        <div className="card-header">
                           <h2>Group Picks For Week {week}</h2>
                        </div>
                        <div className="card-body"> */}
            {/* <div className="table-responsive"> */}
            {/* <table className="table table-dark table-striped"> */}
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
                        {this.props.groupPicks.group_user_initials.map(
                           (user_initials) => {
                              return (
                                 <th
                                    scope="col"
                                    style={{ textAlign: "center" }}
                                 >
                                    {user_initials}
                                 </th>
                              );
                           }
                        )}
                     </tr>
                  </thead>
                  <tbody>
                     {/* each game of the week has one row */}
                     {this.props.groupPicks.match_ups.map((match_up) => {
                        return (
                           <tr>
                              <th scope="row">{match_up.title}</th>
                              {this.props.groupPicks.group_user_names.map(
                                 (user_name) => {
                                    return (
                                       <td
                                          className={classnames({
                                             "locked-pick-group":
                                                match_up.game_at < Date.now(),
                                             "correct-pick-group":
                                                match_up.picks[user_name]
                                                   .pick_result === true,
                                             "incorrect-pick-group":
                                                match_up.picks[user_name]
                                                   .pick_result === false,
                                          })}
                                          style={{ "text-align": "center" }}
                                       >
                                          {match_up.picks[user_name].pick_label}
                                       </td>
                                    );
                                 }
                              )}
                              {/* <td>Mark</td>
                                       <td>Otto</td>
                                       <td>@mdo</td> */}
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
            {/* </div> */}
            {/* </div>
                     </div>
                  </div>
               </div>
            </div> */}
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
