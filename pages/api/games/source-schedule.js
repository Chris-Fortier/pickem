const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
import { get_game_value } from "../../../utils/client_helpers";
import { get_espn_games, match_espn_game } from "../../../utils/espn";

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to compare our schedule for a week with ESPN's, to find games to add and games whose time changed
      // nothing is changed here, it just returns what would change
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/source-schedule?season=2026&week=9
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "GET") {
         const user_id = req.user.id; // get the user id from the JWT
         const season = parseInt(req.query.season);
         const week = parseInt(req.query.week);

         if (isNaN(season) || isNaN(week) || week < 1) {
            return res.status(400).json("A season and week are required.");
         }

         try {
            const users = await mysqldb
               .select("is_admin")
               .from("users")
               .where({ id: user_id });
            if (!users.length || users[0].is_admin !== 1) {
               return res.status(400).json("This user is not an admin.");
            }

            let source_games;
            try {
               source_games = await get_espn_games(season, week);
            } catch (err) {
               console.log(err);
               return res
                  .status(502)
                  .json("Could not get the schedule from ESPN.");
            }

            const our_games = await mysqldb
               .select()
               .from("games")
               .where({ season, week })
               .orderBy("game_at", "asc");

            const now = Date.now();
            const result = {
               adds: [], // games ESPN has that we don't
               updates: [], // games we both have but ESPN has a different time
               num_unchanged: 0, // games we both have with the same time
               skipped: [], // ESPN games we can't use yet
               swapped: [], // games we have with the home and away teams the other way around from ESPN
               not_in_source: [], // games we have that ESPN doesn't
            };
            const matched_game_ids = [];

            source_games.forEach((source_game) => {
               if (!source_game.away_team || !source_game.home_team) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Teams not known yet",
                  });
                  return;
               }

               const { game, swapped_game } = match_espn_game(
                  source_game,
                  our_games
               );
               if (game) {
                  matched_game_ids.push(game.id);
               }
               if (swapped_game) {
                  matched_game_ids.push(swapped_game.id);
               }

               if (!source_game.is_time_confirmed) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Time not confirmed yet",
                  });
               } else if (swapped_game) {
                  result.swapped.push({
                     game_id: swapped_game.id,
                     away_team: swapped_game.away_team,
                     home_team: swapped_game.home_team,
                     game_at: swapped_game.game_at,
                  });
               } else if (game) {
                  if (game.game_at === source_game.game_at) {
                     result.num_unchanged += 1;
                  } else if (game.game_at <= now) {
                     result.skipped.push({
                        name: source_game.name,
                        reason: "Game already started, time not changed",
                     });
                  } else {
                     result.updates.push({
                        game_id: game.id,
                        away_team: game.away_team,
                        home_team: game.home_team,
                        old_game_at: game.game_at,
                        game_at: source_game.game_at,
                     });
                  }
               } else if (source_game.game_at <= now) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Game already started, not added",
                  });
               } else {
                  result.adds.push({
                     season,
                     week,
                     away_team: source_game.away_team,
                     home_team: source_game.home_team,
                     game_at: source_game.game_at,
                     value: get_game_value(week),
                  });
               }
            });

            result.not_in_source = our_games
               .filter((game) => !matched_game_ids.includes(game.id))
               .map((game) => ({
                  game_id: game.id,
                  away_team: game.away_team,
                  home_team: game.home_team,
                  game_at: game.game_at,
               }));

            return res.status(200).json(result);
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
