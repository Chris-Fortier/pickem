const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
const uuid = require("uuid");
import TEAM_NAMES from "../../../utils/TEAM_NAMES";
import { get_game_value } from "../../../utils/client_helpers";

const is_valid_team = (team) =>
   typeof team === "string" && Boolean(TEAM_NAMES[team]);

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to add games and change game times for a week, from what /api/games/source-schedule found
      // To test in Postman:
      // Set the dropdown to POST
      // http://localhost:3000/api/games/schedule-updates
      // in the Body tab choose raw JSON:
      // { "season": 2026, "week": 9, "adds": [{ "away_team": "CIN", "home_team": "ATL", "game_at": 1794148200000 }], "updates": [{ "game_id": "...", "game_at": 1794148200000 }] }
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "POST") {
         const user_id = req.user.id; // get the user id from the JWT
         const { season, week, adds = [], updates = [] } = req.body;
         const now = Date.now();

         if (!Number.isInteger(season) || !Number.isInteger(week)) {
            return res.status(400).json("A season and week are required.");
         }
         if (
            !Array.isArray(adds) ||
            !Array.isArray(updates) ||
            (!adds.length && !updates.length)
         ) {
            return res
               .status(400)
               .json("At least one game to add or update is required.");
         }
         // games can only be added or moved to a time that hasn't happened yet
         const is_valid_game_at = (game_at) =>
            Number.isInteger(game_at) && game_at > now;
         const has_invalid_add = adds.some(
            (game) =>
               !is_valid_team(game.away_team) ||
               !is_valid_team(game.home_team) ||
               game.away_team === game.home_team ||
               !is_valid_game_at(game.game_at)
         );
         const has_invalid_update = updates.some(
            (game) =>
               typeof game.game_id !== "string" ||
               !is_valid_game_at(game.game_at)
         );
         if (has_invalid_add || has_invalid_update) {
            return res
               .status(400)
               .json("One or more games are invalid or already started.");
         }

         try {
            const users = await mysqldb
               .select("is_admin")
               .from("users")
               .where({ id: user_id });
            if (!users.length || users[0].is_admin !== 1) {
               return res.status(400).json("This user is not an admin.");
            }

            const week_games = await mysqldb
               .select("id", "game_at", "away_team", "home_team")
               .from("games")
               .where({ season, week });

            // a team can only play once a week
            const teams_this_week = week_games.flatMap((game) => [
               game.away_team,
               game.home_team,
            ]);
            const teams_to_add = adds.flatMap((game) => [
               game.away_team,
               game.home_team,
            ]);
            const has_team_twice = teams_to_add.some(
               (team, i) =>
                  teams_this_week.includes(team) ||
                  teams_to_add.indexOf(team) !== i
            );
            if (has_team_twice) {
               return res
                  .status(400)
                  .json(
                     "A team would have more than one game this week. Check the schedule again."
                  );
            }

            // only change the time of games this week that haven't started
            const has_invalid_game = updates.some((update) => {
               const game = week_games.find((game) => game.id === update.game_id);
               return !game || game.game_at <= now;
            });
            if (has_invalid_game) {
               return res
                  .status(400)
                  .json(
                     "One or more games are not in this week or already started. Check the schedule again."
                  );
            }

            const new_games = adds.map((game) => ({
               id: uuid.v4(),
               season,
               week,
               game_at: game.game_at,
               value: get_game_value(week),
               away_team: game.away_team,
               home_team: game.home_team,
            }));

            // make all the changes together so they either all save or none do
            await mysqldb.transaction(async (trx) => {
               if (new_games.length) {
                  await trx("games").insert(new_games);
               }
               for (const { game_id, game_at } of updates) {
                  await trx("games").where("id", game_id).update({ game_at });
               }
            });

            return res.status(200).json({
               added: new_games,
               updated: updates.map(({ game_id, game_at }) => ({
                  game_id,
                  game_at,
               })),
            });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
