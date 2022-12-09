import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { get_week_or_season_text } from "../utils/client_helpers";
import axios from "axios";
import { v4 } from "uuid";

export default function EnterScores({
   group_season_week,
   user,
   set_warning_message,
   set_success_message,
   set_danger_message,
}) {
   const [games, set_games] = useState([]);
   const [message_from_server] = useState("");

   useEffect(() => {
      if (user) {
         set_warning_message("Getting games from the server...");
         axios
            .get(
               `/api/games?season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               set_games(
                  // initialize each game with a blank note
                  res.data.map((game) => {
                     return { ...game, note: "" };
                  })
               );
               set_success_message(
                  `Received ${res.data.length} games from the server.`
               );
            })
            .catch((err) => {
               console.log("err", err);

               set_danger_message(
                  "There was a problem getting games from the server."
               );
            });
      }
   }, [group_season_week]);

   const now = Date.now();

   return (
      <>
         <div
            className="my-container bottom-scroll-fix"
            style={{ maxWidth: "630px" }}
         >
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
                     if (game.game_at + 3600000 >= now) {
                        return (
                           <p key={v4()}>
                              {game.away_team} at {game.home_team}
                           </p>
                        );
                     }
                     return (
                        <div key={v4()}>
                           <Input
                              inline
                              label={game.away_team}
                              type="number"
                              name={`${game.id}-away_score`}
                              default_value={game.away_score}
                              min="0"
                              max="200"
                              style={{ width: "50px" }}
                           />
                           at{" "}
                           <Input
                              inline
                              label={game.home_team}
                              type="number"
                              name={`${game.id}-home_score`}
                              default_value={game.home_score}
                              min="0"
                              max="200"
                              style={{ width: "50px" }}
                           />
                           <Button
                              style={{ marginRight: 0 }}
                              label="Update"
                              primary={
                                 game.away_score === null &&
                                 game.home_score === null
                              }
                              secondary={
                                 game.away_score !== null &&
                                 game.home_score !== null
                              }
                              action={() => {
                                 axios
                                    .patch(
                                       `/api/games/update-score?game_id=${
                                          game.id
                                       }&away_score=${
                                          document.getElementById(
                                             `${game.id}-away_score-input`
                                          ).value
                                       }&home_score=${
                                          document.getElementById(
                                             `${game.id}-home_score-input`
                                          ).value
                                       }`
                                    )
                                    .then((res) => {
                                       // insert the response message into this game's note
                                       const new_games = [...games];
                                       new_games[game_index].note = res.data;
                                       new_games[game_index].away_score =
                                          document.getElementById(
                                             `${game.id}-away_score-input`
                                          ).value;
                                       new_games[game_index].home_score =
                                          document.getElementById(
                                             `${game.id}-home_score-input`
                                          ).value;
                                       set_games(new_games);
                                    })
                                    .catch((err) => {
                                       // insert the response error into this game's note
                                       console.log("Error:", err);
                                       const new_games = [...games];
                                       new_games[game_index].note =
                                          "Something went wrong";
                                       set_games(new_games);
                                    });
                              }}
                           />{" "}
                           {game.note}
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </>
   );
}
