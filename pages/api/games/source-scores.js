const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
import { get_espn_games, match_espn_game } from "../../../utils/espn";

const SCORE_FIELDS = ["away_score", "home_score"];

const is_valid_score = (score) =>
   Number.isInteger(score) && score >= 0 && score <= 100;

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to compare our scores for a week with ESPN's final scores, to find scores to fill in
      // nothing is changed here, it just returns what would change
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/source-scores?season=2025&week=8
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
                  .json("Could not get the scores from ESPN.");
            }

            const our_games = await mysqldb
               .select()
               .from("games")
               .where({ season, week })
               .orderBy("game_at", "asc");

            const result = {
               fills: [], // games with no saved score that ESPN has a final score for
               differs: [], // games with a saved score that is different from ESPN's
               num_unchanged: 0, // games with the same saved score as ESPN's
               skipped: [], // ESPN games we can't use yet
               swapped: [], // games we have with the home and away teams the other way around from ESPN
               not_in_ours: [], // ESPN games that are not in our schedule
            };

            source_games.forEach((source_game) => {
               if (!source_game.away_team || !source_game.home_team) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Teams not known yet",
                  });
                  return;
               }
               if (!source_game.is_final) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Not final yet",
                  });
                  return;
               }
               if (
                  !is_valid_score(source_game.away_score) ||
                  !is_valid_score(source_game.home_score)
               ) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "ESPN's score is not valid",
                  });
                  return;
               }

               const { game, swapped_game } = match_espn_game(
                  source_game,
                  our_games
               );
               const scores = {
                  away_score: source_game.away_score,
                  home_score: source_game.home_score,
               };

               if (swapped_game) {
                  result.swapped.push({
                     game_id: swapped_game.id,
                     away_team: swapped_game.away_team,
                     home_team: swapped_game.home_team,
                     game_at: swapped_game.game_at,
                  });
               } else if (!game) {
                  result.not_in_ours.push({
                     away_team: source_game.away_team,
                     home_team: source_game.home_team,
                     game_at: source_game.game_at,
                     ...scores,
                  });
               } else if (
                  SCORE_FIELDS.some(
                     (field) => game[field] !== null && game[field] !== scores[field]
                  )
               ) {
                  result.differs.push({
                     game_id: game.id,
                     away_team: game.away_team,
                     home_team: game.home_team,
                     saved_away_score: game.away_score,
                     saved_home_score: game.home_score,
                     ...scores,
                  });
               } else if (SCORE_FIELDS.some((field) => game[field] === null)) {
                  result.fills.push({
                     game_id: game.id,
                     away_team: game.away_team,
                     home_team: game.home_team,
                     ...scores,
                  });
               } else {
                  result.num_unchanged += 1;
               }
            });

            return res.status(200).json(result);
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
