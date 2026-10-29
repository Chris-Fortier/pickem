import React, { useEffect, useState } from "react";
import isEmpty from "lodash/isEmpty";
import classnames from "classnames";
import Button from "../components/Button";
import Input from "../components/Input";
import { get_week_or_season_text } from "../utils/client_helpers";
import axios from "axios";
import { validate_game_score } from "../validation/fe_validation_utils";
import use_unsaved_changes_warning from "../utils/use_unsaved_changes_warning";

const SCORE_FIELDS = ["away_score", "home_score"];

// the id of the input for a score, used to move to the next score box when pressing enter
const get_score_input_name = (game, field) => `${game.id}-${field}`;

// a score as it is saved on the server, as a string for the input
const get_saved_score = (game, field) =>
   game[field] === null ? "" : String(game[field]);

const GameScoreEditor = ({ game, staged_scores, stage_score, on_enter }) => {
   const get_score_input = (field, label) => {
      const is_changed = field in staged_scores;
      const value = is_changed
         ? staged_scores[field]
         : get_saved_score(game, field);
      return (
         <Input
            inline
            label={label}
            type="text"
            style={{ width: "50px" }}
            name={get_score_input_name(game, field)}
            default_value={get_saved_score(game, field)}
            value={value}
            set_value={(new_value) => stage_score(game, field, new_value)}
            has_changed={is_changed}
            validate={validate_game_score}
            is_valid={!is_changed || validate_game_score(value)}
            on_enter={() => on_enter(game, field)}
         />
      );
   };

   return (
      <div
         className={classnames({
            "game-score-changed": !isEmpty(staged_scores),
         })}
      >
         {get_score_input("away_score", game.away_team)}
         at{" "}
         {get_score_input("home_score", game.home_team)}
      </div>
   );
};

export default function EnterScores({
   group_season_week,
   user,
   set_warning_message,
   set_success_message,
   set_danger_message,
}) {
   const [games, set_games] = useState([]); // the games as they are saved on the server
   const [staged_scores, set_staged_scores] = useState({}); // scores changed in the browser but not saved yet, by game id then field
   const [is_saving, set_is_saving] = useState(false);
   const [message_from_server] = useState("");

   useEffect(() => {
      if (!isEmpty(user)) {
         set_staged_scores({}); // any unsaved changes are for the previous week
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
   }, [group_season_week, user]);

   const now = Date.now();
   const is_game_finished = (game) => game.game_at + 3600000 < now;
   const finished_games = games.filter(is_game_finished);

   const num_changes = Object.keys(staged_scores).length;
   const has_changes = num_changes > 0;
   const has_invalid_scores = Object.values(staged_scores).some((scores) =>
      Object.values(scores).some((score) => !validate_game_score(score))
   );

   // the score to show for a game, which is the staged score if there is one
   const get_shown_score = (game, field) =>
      field in (staged_scores[game.id] || {})
         ? staged_scores[game.id][field]
         : get_saved_score(game, field);

   const num_missing_scores = finished_games.filter((game) =>
      SCORE_FIELDS.some((field) => get_shown_score(game, field) === "")
   ).length;

   // warn the user if they try to leave the page with unsaved changes
   use_unsaved_changes_warning(has_changes);

   // stage a score in the browser, a score that is back to its saved value is no longer a change
   const stage_score = (game, field, value) => {
      const new_staged_scores = { ...staged_scores };
      const game_scores = { ...(new_staged_scores[game.id] || {}) };
      if (value === get_saved_score(game, field)) {
         delete game_scores[field];
      } else {
         game_scores[field] = value;
      }
      if (isEmpty(game_scores)) {
         delete new_staged_scores[game.id];
      } else {
         new_staged_scores[game.id] = game_scores;
      }
      set_staged_scores(new_staged_scores);
   };

   // pressing enter in a score box moves to the next score box
   const focus_next_score_input = (game, field) => {
      const score_input_names = finished_games.flatMap((finished_game) =>
         SCORE_FIELDS.map((score_field) =>
            get_score_input_name(finished_game, score_field)
         )
      );
      const next_name =
         score_input_names[
            score_input_names.indexOf(get_score_input_name(game, field)) + 1
         ];
      if (next_name) {
         document.getElementById(`${next_name}-input`).focus();
      } else {
         document.activeElement.blur(); // last score box
      }
   };

   const save_changes = () => {
      set_is_saving(true);
      set_warning_message("Sending scores to the server...");
      axios
         .patch("/api/games/batch", {
            games: Object.entries(staged_scores).map(([game_id, scores]) => {
               const game = { game_id };
               Object.entries(scores).forEach(([field, score]) => {
                  game[field] = parseInt(score);
               });
               return game;
            }),
         })
         .then((res) => {
            const { updated } = res.data;

            // the updated scores are now what is on the server
            set_games(
               games.map((game) => {
                  if (!updated.includes(game.id)) {
                     return game;
                  }
                  const new_game = { ...game };
                  Object.entries(staged_scores[game.id]).forEach(
                     ([field, score]) => {
                        new_game[field] = parseInt(score);
                     }
                  );
                  return new_game;
               })
            );
            const new_staged_scores = { ...staged_scores };
            updated.forEach((game_id) => delete new_staged_scores[game_id]);
            set_staged_scores(new_staged_scores);

            set_success_message("Scores saved.");
         })
         .catch((err) => {
            console.log("error!", err, err.response);
            set_danger_message(
               "Could not save the scores. You might have a connection issue or the server needs to wake up. Try again in a few moments."
            );
         })
         .finally(() => {
            set_is_saving(false);
         });
   };

   const discard_changes = () => {
      set_staged_scores({});
   };

   return (
      <>
         <div className="my-container" style={{ maxWidth: "630px" }}>
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
                  <p>
                     Changed scores are highlighted and are not saved until
                     you click Save Changes.
                  </p>
                  <p>{message_from_server}</p>
                  {games.map((game, i) => {
                     if (!is_game_finished(game)) {
                        return (
                           <p key={game.id + "-game-score-editor"}>
                              {game.away_team} at {game.home_team} (game not
                              finished)
                           </p>
                        );
                     }
                     return (
                        <React.Fragment key={game.id + "-game-score-editor"}>
                           <GameScoreEditor
                              game={game}
                              staged_scores={staged_scores[game.id] || {}}
                              stage_score={stage_score}
                              on_enter={focus_next_score_input}
                           />
                           {i < games.length - 1 && (
                              <hr style={{ marginTop: 0 }} />
                           )}
                        </React.Fragment>
                     );
                  })}
                  {/* sticks to the bottom of the screen when there are unsaved changes or missing scores and it is scrolled out of view */}
                  <div
                     className={
                        has_changes || num_missing_scores
                           ? "sticky-save-bar"
                           : undefined
                     }
                  >
                     <p>
                        <strong>
                           {num_missing_scores
                              ? `${num_missing_scores} finished ${
                                   num_missing_scores === 1
                                      ? "game still needs"
                                      : "games still need"
                                } scores`
                              : "All finished games have scores"}
                        </strong>
                        {has_invalid_scores && (
                           <>
                              <br />
                              Scores must be whole numbers from 0 to 100.
                           </>
                        )}
                     </p>
                     {/* only show the buttons when there is something to save */}
                     {has_changes && (
                        <>
                           <Button
                              label={`Save Changes (${num_changes})`}
                              action={save_changes}
                              primary
                              is_enabled={!is_saving && !has_invalid_scores}
                           />
                           <Button
                              label="Discard"
                              action={discard_changes}
                              secondary
                              is_enabled={!is_saving}
                           />
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}
