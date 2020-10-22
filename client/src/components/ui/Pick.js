import React from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import teamNames from "../../utils/teamNames";
import classnames from "classnames";
import axios from "axios";

class Pick extends React.Component {
   // only allow changing of pick if game has not stated yet (has server side check too)
   upsertPick(game_id, group_id, pick) {
      // get the previous pick value
      const prev_pick = this.props.pick.pick;

      // if the previous pick is the same as the desired pick, change the new pick to be null (to "cancel" the pick)
      if (prev_pick === pick) {
         pick = null;
      }

      // immediately update Redux for best responsiveness
      this.props.pick.pick = pick;
      this.props.dispatch({
         type: actions.STORE_MY_PICKS,
         payload: [...this.props.myPicks],
      });

      // post a message about waiting for server response
      this.props.dispatch({
         type: actions.STORE_WARNING_MESSAGE,
         payload: "Sending pick to the server...",
      });

      // get my picks from the API
      axios
         .put(
            `/api/v1/picks?game_id=${game_id}&group_id=${group_id}&pick=${pick}`
         )
         .then((res) => {
            // the pick was already updated above

            // post a response message
            this.props.dispatch({
               type: actions.STORE_SUCCESS_MESSAGE,
               payload: "Pick updated.",
            });
         })
         .catch((err) => {
            console.log(err.response);
            // if there was a server error, change the pick back on the client to the previous value
            this.props.pick.pick = prev_pick;
            this.props.dispatch({
               type: actions.STORE_MY_PICKS,
               payload: [...this.props.myPicks],
            });

            // post an error message
            this.props.dispatch({
               type: actions.STORE_DANGER_MESSAGE,
               payload:
                  "Could not send your pick. The server might need to wake up. Try again in a few moments.",
            });
         });
   }

   render() {
      const is_pickable = this.props.pick.game_at > Date.now(); // whether or not you can pick this game
      return (
         <div className="d-flex">
            <div
               className={classnames({
                  "team-choice right": true,
                  "team-choice-picked": this.props.pick.pick === 0,
                  "team-choice-winner":
                     this.props.pick.winner === 0 && this.props.pick.pick === 0,
                  "team-choice-loser":
                     this.props.pick.winner === 0 && this.props.pick.pick === 1,
                  pickable: is_pickable,
                  started: !is_pickable,
               })}
               onClick={() => {
                  if (is_pickable) {
                     this.upsertPick(
                        this.props.pick.game_id,
                        this.props.pick.group_id,
                        0
                     );
                  }
               }}
            >
               {teamNames[this.props.pick.away_team]}
            </div>
            &nbsp;@&nbsp;
            <div
               className={classnames({
                  "team-choice": true,
                  "team-choice-picked": this.props.pick.pick === 1,
                  "team-choice-winner":
                     this.props.pick.winner === 1 && this.props.pick.pick === 1,
                  "team-choice-loser":
                     this.props.pick.winner === 1 && this.props.pick.pick === 0,
                  pickable: is_pickable,
                  started: !is_pickable,
               })}
               onClick={() => {
                  if (is_pickable) {
                     this.upsertPick(
                        this.props.pick.game_id,
                        this.props.pick.group_id,
                        1
                     );
                  }
               }}
            >
               {teamNames[this.props.pick.home_team]}
            </div>
         </div>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { myPicks: state.myPicks };
}

export default connect(mapStateToProps)(Pick);
