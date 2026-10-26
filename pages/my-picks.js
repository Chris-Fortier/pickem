import React, { useEffect, useState } from "react";
import axios from "axios";
import toDisplayDate from "date-fns/format";
import Pick from "../components/Pick";
import Button from "../components/Button";
// import isEmpty from "lodash/isEmpty";
import { get_week_or_season_text } from "../utils/client_helpers";
import TEAM_NAMES from "../utils/TEAM_NAMES";
import use_unsaved_changes_warning from "../utils/use_unsaved_changes_warning";

export default function MyPicks({
   group_season_week,
   user,
   set_warning_message,
   clear_message,
   set_success_message,
   set_danger_message,
}) {
   let rolling_date = 0; // for keeping track when a game is on a new date
   let is_rendering_date = true;
   let is_rendering_time = true;

   const [my_picks, set_my_picks] = useState([]); // the picks as they are saved on the server
   const [staged_picks, set_staged_picks] = useState({}); // picks changed in the browser but not saved yet, by game_id
   const [is_loading, set_is_loading] = useState(true);
   const [is_saving, set_is_saving] = useState(false);

   const num_changes = Object.keys(staged_picks).length;
   const has_changes = num_changes > 0;

   // the pick to show for a game, which is the staged pick if there is one
   const get_shown_pick = (pick) =>
      pick.game_id in staged_picks ? staged_picks[pick.game_id] : pick.pick;

   const num_picks_made = my_picks.filter(
      (pick) => get_shown_pick(pick) !== null
   ).length;
   const has_missing_picks = num_picks_made < my_picks.length;

   useEffect(() => {
      if (user?.id) {
         // note: just checking for user doesn't work because {} is true
         set_my_picks([]);
         set_staged_picks({}); // any unsaved changes are for the previous week
         set_is_loading(true);
         // get the group picks
         set_warning_message(
            "Getting data from the server... If this takes awhile the server might be waking up."
         );
         axios
            .get(
               `/api/picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               set_my_picks(res.data);
               clear_message();
               set_is_loading(false);
            })
            .catch((err) => {
               console.log("err", err);
               set_danger_message(
                  "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments."
               );
            });
      }
   }, [group_season_week, user]);

   // warn the user if they try to leave the page with unsaved changes
   use_unsaved_changes_warning(has_changes);

   // stage a pick in the browser, picking the team that is already picked cancels the pick
   const stage_pick = (pick, pick_choice) => {
      const new_pick = get_shown_pick(pick) === pick_choice ? null : pick_choice;
      const new_staged_picks = { ...staged_picks };
      if (new_pick === pick.pick) {
         delete new_staged_picks[pick.game_id]; // back to what is saved, so it is no longer a change
      } else {
         new_staged_picks[pick.game_id] = new_pick;
      }
      set_staged_picks(new_staged_picks);
   };

   const save_changes = () => {
      set_is_saving(true);
      set_warning_message("Sending picks to the server...");
      axios
         .put("/api/picks/batch", {
            group_id: group_season_week.group_id,
            picks: Object.entries(staged_picks).map(([game_id, pick]) => ({
               game_id,
               pick,
            })),
         })
         .then((res) => {
            const { saved, rejected } = res.data;

            // the saved picks are now what is on the server
            set_my_picks(
               my_picks.map((pick) =>
                  saved.includes(pick.game_id)
                     ? { ...pick, pick: staged_picks[pick.game_id] }
                     : pick
               )
            );
            // keep any picks that couldn't be saved staged so the user can see them
            const new_staged_picks = { ...staged_picks };
            saved.forEach((game_id) => delete new_staged_picks[game_id]);
            set_staged_picks(new_staged_picks);

            if (rejected.length) {
               const rejected_games = my_picks
                  .filter((pick) => rejected.includes(pick.game_id))
                  .map(
                     (pick) =>
                        `${TEAM_NAMES[pick.away_team]} @ ${
                           TEAM_NAMES[pick.home_team]
                        }`
                  );
               set_danger_message(
                  `These picks could not be saved because the game already started: ${rejected_games.join(
                     ", "
                  )}`
               );
            } else {
               set_success_message("Picks saved.");
            }
         })
         .catch((err) => {
            console.log("error!", err, err.response);
            set_danger_message(
               "Could not save your picks. You might have a connection issue or the server needs to wake up. Try again in a few moments."
            );
         })
         .finally(() => {
            set_is_saving(false);
         });
   };

   const discard_changes = () => {
      set_staged_picks({});
   };

   return (
      <>
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
                  {is_loading ? (
                     <p>Loading...</p>
                  ) : (
                     <>
                        <p>
                           Changed picks are highlighted and are not saved
                           until you click Save Changes. You can change your
                           pick for a game as many times as you want until the
                           game starts.
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
                              <span key={pick.game_id}>
                                 {is_rendering_time && <br />}
                                 {is_rendering_date && (
                                    <h5 style={{ textAlign: "center" }}>
                                       {toDisplayDate(
                                          pick.game_at,
                                          "EEE MMM dd"
                                       )}
                                    </h5>
                                 )}
                                 {is_rendering_time && (
                                    <h6 style={{ textAlign: "center" }}>
                                       {toDisplayDate(pick.game_at, "p")}
                                    </h6>
                                 )}
                                 <Pick
                                    pick={{ ...pick, pick: get_shown_pick(pick) }}
                                    is_changed={pick.game_id in staged_picks}
                                    on_pick={(pick_choice) =>
                                       stage_pick(pick, pick_choice)
                                    }
                                 />
                              </span>
                           );
                        })}
                        <br />
                        {/* sticks to the bottom of the screen when there are unsaved changes or missing picks and it is scrolled out of view */}
                        <div
                           className={
                              has_changes || has_missing_picks
                                 ? "sticky-save-bar"
                                 : undefined
                           }
                        >
                           <p>
                              <strong>
                                 {num_picks_made}/{my_picks.length} picks made
                              </strong>
                              {has_missing_picks && (
                                 <>
                                    <br />
                                    You haven&apos;t made all your picks.
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
                                    is_enabled={!is_saving}
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
                     </>
                  )}
               </div>
            </div>
         </div>
      </>
   );
}
