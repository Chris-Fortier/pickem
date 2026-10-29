import React, { useEffect, useState } from "react";
import _ from "lodash";
import isEmpty from "lodash/isEmpty";
import toDisplayDate from "date-fns/format";
import Button from "../components/Button";
import Input from "../components/Input";
import {
   get_week_or_season_text,
   get_game_value,
   DEFAULT_GROUP_SEASON_WEEK,
} from "../utils/client_helpers";
import TEAM_NAMES from "../utils/TEAM_NAMES";
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
   heading,
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

   // delete button
   // only show if the game has not already started
   const [delete_step, set_delete_step] = useState(
      !is_create && game.game_at >= Date.now() ? "waiting" : "disabled"
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
               // update the game locally too so the page's list of games matches the server
               set_games(
                  games
                     .map((game_2) =>
                        game_2.id === game.id
                           ? { ...game_2, ...body.updates }
                           : game_2
                     )
                     .sort((a, b) => a.game_at - b.game_at)
               );
            })
            .catch(() => {
               set_danger_message("Something went wrong");
            });
      } else {
         // create game
         const value = get_game_value(game.week);
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
               set_danger_message(
                  _.get(e, "response.data.message") || "Something went wrong"
               );
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
         {heading && <p>{heading}</p>}
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
         </span>
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
      </>
   );
};

const format_game_at = (game_at) => toDisplayDate(game_at, "EEE MM/dd p");

const format_matchup = (game) =>
   `${TEAM_NAMES[game.away_team]} @ ${TEAM_NAMES[game.home_team]}`;

// shows what would change from checking the schedule so it can be applied
const SourceSchedulePreview = ({
   source_schedule,
   on_update,
   on_cancel,
   is_updating,
}) => {
   const { adds, updates, num_unchanged, skipped, swapped, not_in_source } =
      source_schedule;
   const has_changes = adds.length > 0 || updates.length > 0;

   return (
      <div className="espn-preview">
         <h5>Schedule from ESPN</h5>
         {!has_changes && <p>No games to add or update.</p>}
         {adds.length > 0 && (
            <>
               <p>
                  <strong>Games to add ({adds.length}):</strong>
               </p>
               <ul>
                  {adds.map((game) => (
                     <li key={`${game.away_team}-${game.home_team}`}>
                        {format_game_at(game.game_at)} {format_matchup(game)}
                     </li>
                  ))}
               </ul>
            </>
         )}
         {updates.length > 0 && (
            <>
               <p>
                  <strong>Games with a new time ({updates.length}):</strong>
               </p>
               <ul>
                  {updates.map((game) => (
                     <li key={game.game_id}>
                        {format_matchup(game)}: {format_game_at(game.old_game_at)}{" "}
                        &rarr; {format_game_at(game.game_at)}
                     </li>
                  ))}
               </ul>
            </>
         )}
         {num_unchanged > 0 && (
            <p>
               {num_unchanged} {num_unchanged === 1 ? "game is" : "games are"}{" "}
               already up to date.
            </p>
         )}
         {skipped.length > 0 && (
            <>
               <p>
                  <strong>Skipped ({skipped.length}):</strong>
               </p>
               <ul>
                  {skipped.map((game, i) => (
                     <li key={i}>
                        {game.name}: {game.reason}
                     </li>
                  ))}
               </ul>
            </>
         )}
         {swapped.length > 0 && (
            <>
               <p className="text-danger">
                  <strong>
                     Home and away teams are the other way around on ESPN (
                     {swapped.length}), not changed:
                  </strong>
               </p>
               <ul>
                  {swapped.map((game) => (
                     <li key={game.game_id}>
                        {format_game_at(game.game_at)} {format_matchup(game)}
                     </li>
                  ))}
               </ul>
            </>
         )}
         {not_in_source.length > 0 && (
            <>
               <p className="text-danger">
                  <strong>
                     In our schedule but not ESPN&apos;s ({not_in_source.length}
                     ), not changed:
                  </strong>
               </p>
               <ul>
                  {not_in_source.map((game) => (
                     <li key={game.game_id}>
                        {format_game_at(game.game_at)} {format_matchup(game)}
                     </li>
                  ))}
               </ul>
            </>
         )}
         {has_changes && (
            <Button
               label={is_updating ? "Updating..." : "Update"}
               action={on_update}
               primary
               is_enabled={!is_updating}
            />
         )}
         <Button
            label="Cancel"
            action={on_cancel}
            secondary
            is_enabled={!is_updating}
         />
      </div>
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
   const [source_schedule, set_source_schedule] = useState(null); // what would change from looking up ESPN's schedule
   const [is_getting_schedule, set_is_getting_schedule] = useState(false);
   const [is_updating_schedule, set_is_updating_schedule] = useState(false);

   // only check the schedule for the current week or a future week this season
   const is_check_schedule_enabled =
      group_season_week.season === DEFAULT_GROUP_SEASON_WEEK.season &&
      group_season_week.week !== "all" &&
      group_season_week.week >= DEFAULT_GROUP_SEASON_WEEK.week &&
      !is_getting_schedule &&
      !is_updating_schedule;

   const get_source_schedule = () => {
      set_is_getting_schedule(true);
      set_source_schedule(null);
      set_warning_message("Checking the schedule on ESPN...");
      axios
         .get(
            `/api/games/source-schedule?season=${group_season_week.season}&week=${group_season_week.week}`
         )
         .then((res) => {
            set_source_schedule(res.data);
            set_success_message("Checked the schedule on ESPN.");
         })
         .catch((err) => {
            console.log("err", err);
            set_danger_message(
               _.get(err, "response.data") ||
                  "There was a problem getting the schedule from ESPN."
            );
         })
         .finally(() => {
            set_is_getting_schedule(false);
         });
   };

   const update_from_source_schedule = () => {
      set_is_updating_schedule(true);
      set_warning_message("Updating the schedule...");
      axios
         .post("/api/games/schedule-updates", {
            season: group_season_week.season,
            week: group_season_week.week,
            adds: source_schedule.adds.map(
               ({ away_team, home_team, game_at }) => ({
                  away_team,
                  home_team,
                  game_at,
               })
            ),
            updates: source_schedule.updates.map(({ game_id, game_at }) => ({
               game_id,
               game_at,
            })),
         })
         .then((res) => {
            const { added, updated } = res.data;

            // update the games locally
            const new_games = games.map((game) => {
               const update = updated.find(
                  (update) => update.game_id === game.id
               );
               return update ? { ...game, game_at: update.game_at } : game;
            });
            set_games(
               [...new_games, ...added].sort((a, b) => a.game_at - b.game_at)
            );
            set_source_schedule(null);

            set_success_message(
               `Added ${added.length} ${
                  added.length === 1 ? "game" : "games"
               } and changed the time of ${updated.length} ${
                  updated.length === 1 ? "game" : "games"
               }.`
            );
         })
         .catch((err) => {
            console.log("err", err);
            set_danger_message(
               _.get(err, "response.data") ||
                  "There was a problem updating the schedule."
            );
         })
         .finally(() => {
            set_is_updating_schedule(false);
         });
   };

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
      set_source_schedule(null); // the looked up schedule is for the previous week
      if (!isEmpty(user)) {
         get_games();
      }
   }, [group_season_week, user]);

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
                  <Button
                     label={
                        is_getting_schedule
                           ? "Checking schedule..."
                           : "Check schedule"
                     }
                     action={get_source_schedule}
                     primary={is_check_schedule_enabled}
                     secondary={!is_check_schedule_enabled}
                     is_enabled={is_check_schedule_enabled}
                  />
                  {source_schedule && (
                     <SourceSchedulePreview
                        source_schedule={source_schedule}
                        on_update={update_from_source_schedule}
                        on_cancel={() => set_source_schedule(null)}
                        is_updating={is_updating_schedule}
                     />
                  )}
                  <p>{message_from_server}</p>
                  {games.map((game, i) => {
                     return (
                        <React.Fragment
                           key={`${game.id}-${game.game_at}-game-editor-container`} // include the time so the editor shows a new time from updating the schedule
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
                     key={"make-a-new-game-editor-" + games.length} // use the count of the games so it recreates the editor after a new game is created, but not a uuid so a re-render won't remove focus
                     is_create
                     games={games}
                     set_games={set_games}
                     set_success_message={set_success_message}
                     set_danger_message={set_danger_message}
                     heading={`Make a new ${get_week_or_season_text(
                        group_season_week.week,
                        group_season_week.season
                     ).toLowerCase()} game:`}
                  />
               </div>
            </div>
         </div>
      </>
   );
}
