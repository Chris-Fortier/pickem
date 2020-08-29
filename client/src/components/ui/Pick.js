import React from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import teamNames from "../../utils/teamNames";
import classnames from "classnames";
import axios from "axios";

class Pick extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor
   }

   upsertPick(game_id, group_id, pick) {
      // TODO: do not allow changing of pick if game has already started on client (already have server side check)

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

      // get my picks from the API
      axios
         .put(
            `/api/v1/picks?game_id=${game_id}&group_id=${group_id}&pick=${pick}`
         )
         .then((res) => {
            // the pick was already updated above
         })
         .catch((err) => {
            console.log(err.response);
            // if there was a server error, change the pick back on the client to the previous value
            this.props.pick.pick = prev_pick;
            this.props.dispatch({
               type: actions.STORE_MY_PICKS,
               payload: [...this.props.myPicks],
            });
         });
   }

   render() {
      return (
         <div className="d-flex">
            <div
               className={classnames({
                  "pick-team right": true,
                  "pick-team-selected": this.props.pick.pick === 0,
                  "pick-team-winner": this.props.pick.winner === 0,
               })}
               onClick={() => {
                  this.upsertPick(
                     this.props.pick.game_id,
                     this.props.pick.group_id,
                     0
                  );
               }}
            >
               {teamNames[this.props.pick.away_team]}
            </div>
            &nbsp;@&nbsp;
            <div
               className={classnames({
                  "pick-team": true,
                  "pick-team-selected": this.props.pick.pick === 1,
                  "pick-team-winner": this.props.pick.winner === 1,
               })}
               onClick={() => {
                  this.upsertPick(
                     this.props.pick.game_id,
                     this.props.pick.group_id,
                     1
                  );
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
