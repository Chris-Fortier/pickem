import React from "react";
import NavBar from "../ui/NavBar";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
import toDisplayDate from "date-fns/format";
import Pick from "../ui/Pick";
import isEmpty from "lodash/isEmpty";

const group_id = "3fd8d78c-8151-4145-b276-aea3559deb76";
const season = 2020;
const week = 1;

class GroupPicks extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor

      this.state = {
         group_user_names: [],
         group_user_initials: [],
         match_ups: [],
      };
   }

   // this is a "lifecycle" method like render(), we don't need to call it manually
   componentDidMount() {
      // if there is not user logged in
      if (isEmpty(this.props.currentUser)) {
         // send to landing page
         this.props.history.push("/");
      } else {
         // do what needs to be done when loading the page
         this.getGroupPicks();
      }
   }

   getGroupPicks() {
      // get my picks from the API
      axios
         .get(
            `/api/v1/picks/group-week?group_id=${group_id}&season=${season}&week=${week}`
         )
         .then((res) => {
            // send the data to state of component
            // this.setState({ group_picks: res.data });

            // process the data into an array of objects (one object per game with a pick for each user)

            const game_user_picks = res.data; // the data from server (one object for every combination of user and game)
            const group_user_names = []; // an array of user names
            const group_user_initials = []; // an array of user initials
            const match_ups = []; // an array of objects (one object per game with a pick for each user)
            const game_ids = [];
            const num_completed_games = 0;

            for (let i in game_user_picks) {
               if (!group_user_names.includes(game_user_picks[i].user_name)) {
                  group_user_names.push(game_user_picks[i].user_name); // add a new user name
                  group_user_initials.push(game_user_picks[i].user_initials); // add a new user initials
               }

               // if this game_user_pick refers to a new game
               if (!game_ids.includes(game_user_picks[i].game_id)) {
                  // make a new match up and put the data for the game in it
                  game_ids.push(game_user_picks[i].game_id);
                  match_ups.push({
                     title: `${game_user_picks[i].away_team} @ ${game_user_picks[i].home_team}`,
                     game_id: game_user_picks[i].game_id,
                     game_at: game_user_picks[i].game_at,
                     winner: game_user_picks[i].winner,
                     picks: {}, // empty object to store all the picks as key (user_name) value (pick) pairs
                  });
                  if (game_user_picks[i].winner !== null) {
                     num_completed_games++;
                  }
               }

               // set the label of the pick
               let pick_label = "";
               if (game_user_picks[i].pick === 0) {
                  pick_label = game_user_picks[i].away_team;
               } else if (game_user_picks[i].pick === 1) {
                  pick_label = game_user_picks[i].home_team;
               } else if (game_user_picks[i].pick === 2) {
                  pick_label = "picked";
               } else if (game_user_picks[i].pick === null) {
                  pick_label = "-";
               }

               // get the result of the pick
               let pick_result = null;
               if (game_user_picks[i].winner !== null) {
                  if (game_user_picks[i].pick === game_user_picks[i].winner) {
                     pick_result = true;
                  } else {
                     pick_result = false;
                  }
               }

               // find the match_up that this game_user_pick refers to and add the pick to it
               match_ups.find((match_up) => {
                  return match_up.game_id === game_user_picks[i].game_id;
               }).picks[game_user_picks[i].user_name] = {
                  pick: game_user_picks[i].pick,
                  pick_label,
                  pick_result,
               };
            }

            this.setState({
               group_user_names,
               group_user_initials,
               match_ups,
            });
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);
         });
   }

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
               <NavBar />
               <div className="card card-header">
                  <h2>Group Picks For Week {week}</h2>
               </div>
               <table className="table-dark table-striped">
                  <thead>
                     <tr>
                        <th scope="col">Game</th>
                        {/* list the user names across the top of the table */}
                        {this.state.group_user_initials.map((user_initials) => {
                           return <th scope="col">{user_initials}</th>;
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {/* each game of the week has one row */}
                     {this.state.match_ups.map((match_up) => {
                        return (
                           <tr>
                              <th scope="row">{match_up.title}</th>
                              {this.state.group_user_names.map((user_name) => {
                                 return (
                                    <td>
                                       {match_up.picks[user_name].pick_label}
                                    </td>
                                 );
                              })}
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
   return { currentUser: state.currentUser };
}

export default connect(mapStateToProps)(GroupPicks);
