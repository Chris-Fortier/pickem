const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");

const SCORE_FIELDS = ["away_score", "home_score"];

const is_valid_score = (score) =>
   Number.isInteger(score) && score >= 0 && score <= 100;

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to update the scores of multiple games at once
      // To test in Postman:
      // Set the dropdown to PATCH
      // http://localhost:3000/api/games/batch
      // in the Body tab choose raw JSON: { "games": [{ "game_id": "...", "away_score": 21, "home_score": 14 }] }
      // away_score and home_score are each optional, but at least one is needed per game
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "PATCH") {
         const user_id = req.user.id; // get the user id from the JWT
         const { games } = req.body;

         if (!Array.isArray(games) || !games.length) {
            return res.status(400).json("At least one game is required.");
         }

         // only allow the score fields to be updated
         const updates = games.map((game) => {
            const fields = {};
            SCORE_FIELDS.forEach((field) => {
               if (field in game) {
                  fields[field] = game[field];
               }
            });
            return { game_id: game.game_id, fields };
         });
         const has_invalid_game = updates.some(
            ({ game_id, fields }) =>
               typeof game_id !== "string" ||
               !Object.keys(fields).length ||
               !Object.values(fields).every(is_valid_score)
         );
         if (has_invalid_game) {
            return res.status(400).json("One or more scores are invalid.");
         }

         try {
            const users = await mysqldb
               .select("is_admin")
               .from("users")
               .where({ id: user_id });
            if (!users.length || users[0].is_admin !== 1) {
               return res.status(400).json("This user is not an admin.");
            }

            // update all the games together so they either all save or none do
            await mysqldb.transaction(async (trx) => {
               for (const { game_id, fields } of updates) {
                  await trx("games").where("id", game_id).update(fields);
               }
            });

            return res.status(200).json({
               updated: updates.map(({ game_id }) => game_id),
            });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
