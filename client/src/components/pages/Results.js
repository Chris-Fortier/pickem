import React, { useEffect, useState } from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
// import classnames from "classnames";
import { get_week_or_season_text } from "../../utils/helpers";
// import toDisplayDate from "date-fns/format";
import axios from "axios";
import uuid from "uuid";

function Results({ group_season_week }) {
   const [games, set_games] = useState([]);
   useEffect(() => {
      console.log("use effect");
      axios
         // .get(
         //    `/api/v1/picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
         // )
         .get(
            `/api/v1/games?season=${group_season_week.season}&week=${group_season_week.week}`
         )
         .then((res) => {
            console.log("res", res);
            set_games(res.data);
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // todo: post some message
         });
   }, [group_season_week]);
   return (
      <>
         <NavBar />
         <div className="my-container">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     Results For&nbsp;
                     {group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                  </h2>
               </div>
               <div className="card-body">
                  {games.map((game) => {
                     return (
                        <p key={uuid.v4()}>
                           {game.away_team}{" "}
                           <input
                              type="number"
                              id={`${game.id}-away_score`}
                              defaultValue={game.away_score}
                              min="0"
                              max="200"
                           />{" "}
                           at {game.home_team}{" "}
                           <input
                              type="number"
                              id={`${game.id}-home_score`}
                              defaultValue={game.home_score}
                              min="0"
                              max="200"
                           />
                           <button
                              onClick={() => {
                                 console.log("clicked");
                                 axios
                                    // .get(
                                    //    `/api/v1/picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
                                    // )
                                    .patch(
                                       `/api/v1/games/update-score?game_id=${
                                          game.id
                                       }&away_score=${
                                          document.getElementById(
                                             `${game.id}-away_score`
                                          ).value
                                       }&home_score=${
                                          document.getElementById(
                                             `${game.id}-home_score`
                                          ).value
                                       }`
                                    )
                                    .then((res) => {
                                       console.log("res", res);
                                    })
                                    .catch((err) => {
                                       const data = err.response.data;
                                       console.log("err", data);
                                    });
                              }}
                           >
                              Update
                           </button>
                        </p>
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
   };
}

export default connect(mapStateToProps)(Results);
