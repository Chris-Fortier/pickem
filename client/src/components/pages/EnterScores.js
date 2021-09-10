import React, { useEffect, useState } from "react";
import NavBar from "../ui/NavBar";
import { connect } from "react-redux";
import { get_week_or_season_text } from "../../utils/helpers";
import axios from "axios";
import uuid from "uuid";

function EnterScores({ group_season_week }) {
   const [games, set_games] = useState([]);
   const [message_from_server, set_message_from_server] = useState("");

   useEffect(() => {
      console.log("use effect");
      set_message_from_server("Getting games from the server...");
      axios
         .get(
            `/api/v1/games?season=${group_season_week.season}&week=${group_season_week.week}`
         )
         .then((res) => {
            console.log("res", res);
            set_games(
               // initialize each game with a blank note
               res.data.map((game) => {
                  return { ...game, note: "" };
               })
            );
            set_message_from_server(
               `Received ${res.data.length} games from the server.`
            );
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);

            // todo: post some message
            set_message_from_server(
               "There was a problem getting games from the server."
            );
         });
   }, [group_season_week]);

   return (
      <>
         <NavBar />
         <div className="my-container">
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     Enter Scores for&nbsp;
                     {group_season_week.season}
                     &nbsp;
                     {get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     )}
                  </h2>
               </div>
               <div className="card-body">
                  <p>{message_from_server}</p>
                  {games.map((game, game_index) => {
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
                                       // insert the response message into this game's note
                                       const new_games = [...games];
                                       new_games[game_index].note = res.data;
                                       set_games(new_games);
                                    })
                                    .catch((err) => {
                                       // insert the response error into this game's note
                                       const new_games = [...games];
                                       new_games[game_index].note =
                                          err.response.data;
                                       set_games(new_games);
                                    });
                              }}
                           >
                              Update
                           </button>{" "}
                           {game.note}
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

export default connect(mapStateToProps)(EnterScores);
