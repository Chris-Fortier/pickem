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

function MyPicks({ group_season_week, my_picks }) {
   let rolling_date = 0; // for keeping track when a game is on a new date
   let is_rendering_date = true;
   let is_rendering_time = true;

   return (
      <>
         <NavBar />
         <div className="my-container">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     My Picks For&nbsp;
                     {group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                  </h2>
               </div>
               <div className="card-body">
                  <p>
                     Each pick is saved as soon as it is selected. You can
                     change your pick for a game as many times as you want until
                     the game starts.
                  </p>
                  {my_picks.map((pick) => {
                     if (pick.game_at > rolling_date + 43200000) {
                        is_rendering_date = true;
                        is_rendering_time = true;
                     } else if (pick.game_at > rolling_date) {
                        is_rendering_date = false;
                        is_rendering_time = true;
                     } else {
                        is_rendering_date = false;
                        is_rendering_time = false;
                     }
                     rolling_date = pick.game_at;
                     return (
                        <span key={uuid.v4()}>
                           {is_rendering_time && <br />}
                           {is_rendering_date && (
                              <h5 align="center">
                                 {toDisplayDate(pick.game_at, "EEE MMM dd")}
                              </h5>
                           )}
                           {is_rendering_time && (
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
      group_season_week: state.group_season_week,
      my_picks: state.my_picks,
   };
}

export default connect(mapStateToProps)(MyPicks);
