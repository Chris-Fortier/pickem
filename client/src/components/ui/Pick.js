import React from "react";
import actions from "../../store/actions";
import { connect } from "react-redux";
import teamNames from "../../utils/teamNames";

class Pick extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor
   }

   render() {
      return (
         <div>
            {teamNames[this.props.pick.away_team]}&nbsp;@&nbsp;
            {teamNames[this.props.pick.home_team]}
         </div>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { viewedSponsorship: state.viewedSponsorship };
}

export default connect(mapStateToProps)(Pick);
