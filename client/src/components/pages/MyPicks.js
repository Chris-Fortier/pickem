import React from "react";
import NavBar from "../ui/NavBar";
// import actions from "../../store/actions";
import { connect } from "react-redux";
// import axios from "axios";
import toDisplayDate from "date-fns/format";
import Pick from "../ui/Pick";
// import isEmpty from "lodash/isEmpty";
import { get_week_or_season_text } from "../../utils/helpers";
import uuid from "uuid";

// const group_id = "3fd8d78c-8151-4145-b276-aea3559deb76";
// const season = 2020;
// const week = 1;

function MyPicks({ groupSeasonWeek, myPicks }) {
   let rollingDate = 0; // for keeping track when a game is on a new date
   let renderDate = true;
   let renderTime = true;

   return (
      <>
         <NavBar />
         <div className="my-container">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     My Picks For&nbsp;
                     {groupSeasonWeek.season}
                     &nbsp;
                     {get_week_or_season_text(
                        groupSeasonWeek.week,
                        groupSeasonWeek.season
                     )}
                  </h2>
               </div>
               <div className="card-body">
                  <p>
                     Each pick is saved as soon as it is selected. You can
                     change your pick for a game as many times as you want until
                     the game starts.
                  </p>
                  {myPicks.map((pick) => {
                     if (pick.game_at > rollingDate + 43200000) {
                        renderDate = true;
                        renderTime = true;
                     } else if (pick.game_at > rollingDate) {
                        renderDate = false;
                        renderTime = true;
                     } else {
                        renderDate = false;
                        renderTime = false;
                     }
                     rollingDate = pick.game_at;
                     return (
                        <span key={uuid.v4()}>
                           {renderTime && <br />}
                           {renderDate && (
                              <h5 align="center">
                                 {toDisplayDate(pick.game_at, "EEE MMM dd")}
                              </h5>
                           )}
                           {renderTime && (
                              <h6 align="center">
                                 {toDisplayDate(pick.game_at, "p")}
                              </h6>
                           )}
                           <Pick pick={pick} />
                        </span>
                     );
                  })}
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
      myPicks: state.myPicks,
   };
}

export default connect(mapStateToProps)(MyPicks);
