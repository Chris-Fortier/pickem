import React, { useEffect, useState } from "react";
import toDisplayDate from "date-fns/format";
import Button from "../components/Button";
import Input from "../components/Input";
import { get_week_or_season_text } from "../utils/client_helpers";
import {
   validate_game_date,
   validate_time,
   validate_team_abbr,
   convert_date_string_to_ms,
   convert_to_tod_ms,
   test,
} from "../validation/fe_validation_utils";
import axios from "axios";

const GameEditor = ({ game }) => {
   // date
   const [date_default, set_date_default] = useState(
      toDisplayDate(game.game_at, "MM/dd/yyyy")
   );
   const [date, set_date] = useState(toDisplayDate(game.game_at, "MM/dd/yyyy"));
   const [has_date_changed, set_has_date_changed] = useState(false);
   const [is_date_valid, set_is_date_valid] = useState(true);

   // time
   const [time_default, set_time_default] = useState(
      toDisplayDate(game.game_at, "HH:mm")
   );
   const [time, set_time] = useState(toDisplayDate(game.game_at, "HH:mm"));
   const [has_time_changed, set_has_time_changed] = useState(false);
   const [is_time_valid, set_is_time_valid] = useState(true);

   // away team
   const [away_team_default, set_away_team_default] = useState(game.away_team);
   const [away_team, set_away_team] = useState(game.away_team);
   const [has_away_team_changed, set_has_away_team_changed] = useState(false);
   const [is_away_team_valid, set_is_away_team_valid] = useState(true);

   // home team
   const [home_team_default, set_home_team_default] = useState(game.home_team);
   const [home_team, set_home_team] = useState(game.home_team);
   const [has_home_team_changed, set_has_home_team_changed] = useState(false);
   const [is_home_team_valid, set_is_home_team_valid] = useState(true);

   const [message, set_message] = useState("");

   const is_update_enabled =
      (has_date_changed ||
         has_time_changed ||
         has_away_team_changed ||
         has_home_team_changed) &&
      is_date_valid &&
      is_time_valid &&
      is_away_team_valid &&
      is_home_team_valid;

   const update_editor = () => {
      set_has_date_changed(false);
      set_date_default(date);
      set_has_time_changed(false);
      set_time_default(time);
      set_has_away_team_changed(false);
      set_away_team_default(away_team);
      set_has_home_team_changed(false);
      set_home_team_default(home_team);
   };

   return (
      <>
         {/* <p>{game.id}</p> */}
         <Input
            inline
            label="d"
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
         />
         <Input
            inline
            label="t"
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
         />
         <Input
            inline
            label="v"
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
         />
         <Input
            inline
            label="h"
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
                     ...(has_date_changed ||
                        (has_time_changed && {
                           game_at:
                              convert_date_string_to_ms(date) +
                              convert_to_tod_ms(time),
                        })),
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

export default function Schedule({
   group_season_week,
   user,
   set_warning_message,
   set_success_message,
   set_danger_message,
}) {
   const [games, set_games] = useState([]);
   const [message_from_server] = useState("");

   useEffect(() => {
      test();
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

   return (
      <>
         <div
            className="my-container bottom-scroll-fix"
            style={{ maxWidth: "630px" }}
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
                        <>
                           <GameEditor
                              game={game}
                              key={game.id + "-game-editor-container"}
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
