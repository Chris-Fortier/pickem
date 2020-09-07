import React from "react";
import NavBar from "../ui/NavBar";
// import actions from "../../store/actions";
import { connect } from "react-redux";
// import axios from "axios";
// import toDisplayDate from "date-fns/format";
// import isEmpty from "lodash/isEmpty";

class Standings extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor

      this.state = {};
   }

   render() {
      return (
         <>
            <NavBar parentProps={this.props} />
            <div className="container">
               <div className="row">
                  <div className="col col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                     <div className="card mt-5 mb-5">
                        <div className="card-header">
                           <h2>
                              {this.props.groupSeasonWeek.season}&nbsp;Standings
                           </h2>
                        </div>
                        <div className="card-body">
                           <table style={{ width: "100%" }}>
                              <tr>
                                 {/* <th>Rank</th> */}
                                 <th>Player</th>
                                 <th>CP</th>
                                 <th>PB</th>
                              </tr>
                              {this.props.standings.map((user) => {
                                 const initials = user.initials.toUpperCase();
                                 return (
                                    <tr
                                       style={{
                                          "border-top": "gray 1px solid",
                                       }}
                                    >
                                       <td>
                                          {user.rank}.&nbsp;{user.team_name}
                                          &nbsp;({initials})
                                       </td>
                                       <td>{user.num_correct}</td>
                                       <td>{user.num_behind}</td>
                                    </tr>
                                 );
                              })}
                           </table>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      groupSeasonWeek: state.groupSeasonWeek,
      standings: state.standings,
   };
}

export default connect(mapStateToProps)(Standings);
