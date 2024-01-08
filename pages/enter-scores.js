import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { get_week_or_season_text } from "../utils/client_helpers";
import axios from "axios";
import { validate_game_score } from "../validation/fe_validation_utils";

const GameScoreEditor = ({ game }) => {
   // away score
   const [away_score_default, set_away_score_default] = useState(
      game.away_score
   );
   const [away_score, set_away_score] = useState(game.away_score);
   const [has_away_score_changed, set_has_away_score_changed] = useState(false);
   const [is_away_score_valid, set_is_away_score_valid] = useState(true);

   // home score
   const [home_score_default, set_home_score_default] = useState(
      game.home_score
   );
   const [home_score, set_home_score] = useState(game.home_score);
   const [has_home_score_changed, set_has_home_score_changed] = useState(false);
   const [is_home_score_valid, set_is_home_score_valid] = useState(true);

   const [message, set_message] = useState("");

   const is_update_enabled =
      (has_away_score_changed || has_home_score_changed) &&
      is_away_score_valid &&
      is_home_score_valid;

   const update_editor = () => {
      set_has_away_score_changed(false);
      set_away_score_default(away_score);
      set_has_home_score_changed(false);
      set_home_score_default(home_score);
   };

   return (
      <>
         <Input
            inline
            label={game.away_team}
            type="text"
            style={{ width: "50px" }}
            name={`${game.id}-away_score`}
            default_value={away_score_default}
            value={away_score}
            set_value={set_away_score}
            has_changed={has_away_score_changed}
            set_has_changed={set_has_away_score_changed}
            validate={validate_game_score}
            is_valid={is_away_score_valid}
            set_is_valid={set_is_away_score_valid}
         />
         at{" "}
         <Input
            inline
            label={game.home_team}
            type="text"
            style={{ width: "50px" }}
            name={`${game.id}-home_score`}
            default_value={home_score_default}
            value={home_score}
            set_value={set_home_score}
            has_changed={has_home_score_changed}
            set_has_changed={set_has_home_score_changed}
            validate={validate_game_score}
            is_valid={is_home_score_valid}
            set_is_valid={set_is_home_score_valid}
         />
         <Button
            style={{ marginRight: 0 }}
            label="Update"
            primary={is_update_enabled}
            secondary={!is_update_enabled}
            is_enabled={is_update_enabled}
            action={() => {
               const body = {
                  game_id: game.id,
                  updates: {
                     ...(has_away_score_changed && {
                        away_score: away_score,
                     }),
                     ...(has_home_score_changed && {
                        home_score: home_score,
                     }),
                  },
               };
               axios
                  .patch(`/api/games`, body)
                  .then((res) => {
                     set_message(res.data);
                     update_editor();
                  })
                  .catch(() => {
                     set_message("Something went wrong");
                  });
            }}
         />{" "}
         {message}
      </>
   );
};

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
               set_games(res.data);
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
                  {games.map((game, i) => {
                     if (game.game_at + 3600000 >= now) {
                        return (
                           <p key={game.id + "-game-score-editor"}>
                              {game.away_team} at {game.home_team}
                           </p>
                        );
                     }
                     return (
                        <>
                           <GameScoreEditor
                              game={game}
                              key={game.id + "-game-score-editor"}
                           />
                           {i < games.length - 1 && (
                              <hr style={{ marginTop: 0 }} />
                           )}
                        </>
                     );
                  })}
               </div>
            </div>
         </div>
      </>
   );
}
