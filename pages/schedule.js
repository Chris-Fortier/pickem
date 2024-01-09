import React, { useEffect, useState } from "react";
import toDisplayDate from "date-fns/format";
import { v4 } from "uuid";
import Button from "../components/Button";
import Input from "../components/Input";
import { get_week_or_season_text } from "../utils/client_helpers";
import {
   validate_game_date,
   validate_time,
   validate_team_abbr,
   convert_date_string_to_ms,
   convert_to_tod_ms,
   // test,
} from "../validation/fe_validation_utils";
import axios from "axios";

const GameEditor = ({
   game,
   is_create = false,
   games,
   set_games,
   set_success_message,
   set_danger_message,
}) => {
   // date
   const [date_default, set_date_default] = useState(
      game.game_at ? toDisplayDate(game.game_at, "MM/dd/yyyy") : ""
   );
   const [date, set_date] = useState(
      game.game_at ? toDisplayDate(game.game_at, "MM/dd/yyyy") : ""
   );
   const [has_date_changed, set_has_date_changed] = useState(false);
   const [is_date_valid, set_is_date_valid] = useState(!is_create);

   // time
   const [time_default, set_time_default] = useState(
      game.game_at ? toDisplayDate(game.game_at, "HH:mm") : ""
   );
   const [time, set_time] = useState(
      game.game_at ? toDisplayDate(game.game_at, "HH:mm") : ""
   );
   const [has_time_changed, set_has_time_changed] = useState(false);
   const [is_time_valid, set_is_time_valid] = useState(!is_create);

   // away team
   const [away_team_default, set_away_team_default] = useState(game.away_team);
   const [away_team, set_away_team] = useState(game.away_team);
   const [has_away_team_changed, set_has_away_team_changed] = useState(false);
   const [is_away_team_valid, set_is_away_team_valid] = useState(!is_create);

   // home team
   const [home_team_default, set_home_team_default] = useState(game.home_team);
   const [home_team, set_home_team] = useState(game.home_team);
   const [has_home_team_changed, set_has_home_team_changed] = useState(false);
   const [is_home_team_valid, set_is_home_team_valid] = useState(!is_create);

   const [delete_step, set_delete_step] = useState(
      !is_create ? "waiting" : "disabled"
   );

   const is_update_enabled =
      (has_date_changed ||
         has_time_changed ||
         has_away_team_changed ||
         has_home_team_changed) &&
      is_date_valid &&
      is_time_valid &&
      is_away_team_valid &&
      is_home_team_valid;

   const refresh_editor = () => {
      set_has_date_changed(false);
      set_date_default(date);
      set_has_time_changed(false);
      set_time_default(time);
      set_has_away_team_changed(false);
      set_away_team_default(away_team);
      set_has_home_team_changed(false);
      set_home_team_default(home_team);
   };

   const clear_editor = () => {
      // clear the create editor for the next one

      set_has_date_changed(false);
      set_date_default("");
      set_date("");
      set_is_date_valid(false);

      set_has_time_changed(false);
      set_time_default(time);
      set_time("");
      set_is_time_valid(false);

      set_has_away_team_changed(false);
      set_away_team_default(away_team);
      set_away_team("");
      set_is_away_team_valid(false);

      set_has_home_team_changed(false);
      set_home_team_default(home_team);
      set_home_team("");
      set_is_home_team_valid(false);
   };

   const action = () => {
      if (!is_create) {
         // update game
         const body = {
            game_id: game.id,
            updates: {
               ...((has_date_changed || has_time_changed) && {
                  game_at:
                     convert_date_string_to_ms(date) + convert_to_tod_ms(time),
               }),
               ...(has_away_team_changed && {
                  away_team: away_team.toUpperCase(),
               }),
               ...(has_home_team_changed && {
                  home_team: home_team.toUpperCase(),
               }),
            },
         };
         axios
            .patch(`/api/games`, body)
            .then((res) => {
               set_success_message(res.data);
               refresh_editor();
            })
            .catch(() => {
               set_danger_message("Something went wrong");
            });
      } else {
         // create game
         let value = 1;
         if (game.week >= 19) {
            value = 2;
         }
         if (game.week == 21) {
            value = 4;
         }
         if (game.week == 22) {
            value = 8;
         }
         const body = {
            new_game: {
               season: game.season,
               week: game.week,
               game_at:
                  convert_date_string_to_ms(date) + convert_to_tod_ms(time),
               value,
               away_team: away_team.toUpperCase(),
               home_team: home_team.toUpperCase(),
            },
         };
         axios
            .post(`/api/games`, body)
            .then((res) => {
               set_success_message(res.data.message);
               // add the new game locally
               const new_games = [
                  ...games,
                  {
                     ...body.new_game,
                     id: res.data.new_game_id,
                  },
               ];
               set_games(new_games);
               clear_editor();
            })
            .catch((e) => {
               set_danger_message("Something went wrong");
               console.log(e);
            });
      }
   };

   const on_input_enter = () => {
      if (is_update_enabled) {
         action();
      }
   };

   return (
      <>
         <span style={{ whiteSpace: "nowrap" }}>
            <Input
               inline
               type="text"
               style={{ width: "110px" }}
               name={`${game.id}-date`}
               default_value={date_default}
               value={date}
               set_value={set_date}
               has_changed={has_date_changed}
               set_has_changed={set_has_date_changed}
               validate={validate_game_date}
               is_valid={is_date_valid}
               set_is_valid={set_is_date_valid}
               on_enter={on_input_enter}
               placeholder="1/13/24"
            />
            <Input
               inline
               type="text"
               style={{ width: "70px" }}
               name={`${game.id}-time`}
               default_value={time_default}
               value={time}
               set_value={set_time}
               has_changed={has_time_changed}
               set_has_changed={set_has_time_changed}
               validate={validate_time}
               is_valid={is_time_valid}
               set_is_valid={set_is_time_valid}
               on_enter={on_input_enter}
               placeholder="1330"
            />
         </span>
         <span style={{ whiteSpace: "nowrap" }}>
            <Input
               inline
               type="text"
               style={{ width: "60px" }}
               name={`${game.id}-away_team`}
               default_value={away_team_default}
               value={away_team}
               set_value={set_away_team}
               has_changed={has_away_team_changed}
               set_has_changed={set_has_away_team_changed}
               validate={validate_team_abbr}
               is_valid={is_away_team_valid}
               set_is_valid={set_is_away_team_valid}
               on_enter={on_input_enter}
               placeholder="SF"
            />
            <Input
               inline
               label="@"
               type="text"
               style={{ width: "60px" }}
               name={`${game.id}-home_team`}
               default_value={home_team_default}
               value={home_team}
               set_value={set_home_team}
               has_changed={has_home_team_changed}
               set_has_changed={set_has_home_team_changed}
               validate={validate_team_abbr}
               is_valid={is_home_team_valid}
               set_is_valid={set_is_home_team_valid}
               on_enter={on_input_enter}
               placeholder="SEA"
            />
         </span>
         <span style={{ whiteSpace: "nowrap" }}>
            <Button
               label={!is_create ? "Update" : "Create"}
               primary={is_update_enabled}
               secondary={!is_update_enabled}
               is_enabled={is_update_enabled}
               action={action}
            />
            {(delete_step === "waiting" || delete_step === "confirmation") && (
               <Button
                  label={delete_step === "waiting" ? "Delete..." : "Cancel"}
                  danger={delete_step === "waiting"}
                  secondary={delete_step === "confirmation"}
                  action={() => {
                     delete_step === "waiting"
                        ? set_delete_step("confirmation")
                        : set_delete_step("waiting");
                  }}
               />
            )}
            {delete_step === "confirmation" && (
               <Button
                  label={"Press to delete"}
                  danger
                  action={() => {
                     // delete game
                     axios
                        .delete(`/api/games?game_id=${game.id}`)
                        .then((res) => {
                           set_success_message(res.data);
                           // remove the game locally
                           const new_games = games.filter(
                              (game_2) => game_2.id !== game.id
                           );
                           set_games(new_games);
                        })
                        .catch(() => {
                           set_danger_message("Something went wrong");
                        });
                  }}
               />
            )}
         </span>
      </>
   );
};

export default function Schedule({
   group_season_week,
   user,
   set_warning_message,
   set_success_message,
   set_danger_message,
}) {
   const [games, set_games] = useState([]);
   const [message_from_server] = useState("");

   const get_games = () => {
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
   };

   useEffect(() => {
      // test(); // run tests for the validation utility functions
      if (user) {
         get_games();
      }
   }, [group_season_week]);

   return (
      <>
         <div
            className="my-container bottom-scroll-fix"
            style={{ maxWidth: "680px" }}
         >
            <div className="my-card">
               <div className="card-header">
                  <h2>
                     Schedule for&nbsp;
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
                     return (
                        <React.Fragment
                           key={game.id + "-game-editor-container"}
                        >
                           <GameEditor
                              game={game}
                              games={games}
                              set_games={set_games}
                              set_success_message={set_success_message}
                              set_danger_message={set_danger_message}
                           />
                           {i < games.length && <hr style={{ marginTop: 0 }} />}
                        </React.Fragment>
                     );
                  })}
                  <GameEditor
                     game={{
                        season: group_season_week.season,
                        week: group_season_week.week,
                     }}
                     key={v4()} // use a uuid so it recreates the editor after a new game is created and no residual input data is here
                     is_create
                     games={games}
                     set_games={set_games}
                     set_success_message={set_success_message}
                     set_danger_message={set_danger_message}
                  />
               </div>
            </div>
         </div>
      </>
   );
}
