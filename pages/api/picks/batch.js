const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to save multiple picks at once
      // To test in Postman:
      // Set the dropdown to PUT
      // http://localhost:3000/api/picks/batch
      // in the Body tab choose raw JSON: { "group_id": "...", "picks": [{ "game_id": "...", "pick": 0 }] }
      // pick can be 0 (away team), 1 (home team) or null (cancel the pick)
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "PUT") {
         const user_id = req.user.id; // get the user id from the JWT
         const { group_id, picks } = req.body;

         if (!group_id || !Array.isArray(picks) || !picks.length) {
            return res
               .status(400)
               .json("A group_id and at least one pick are required.");
         }
         const has_invalid_pick = picks.some(
            (pick) =>
               typeof pick.game_id !== "string" ||
               ![0, 1, null].includes(pick.pick)
         );
         if (has_invalid_pick) {
            return res.status(400).json("One or more picks are invalid.");
         }

         try {
            // only allow picks for games that haven't started yet
            const games = await mysqldb
               .select("id", "game_at")
               .from("games")
               .whereIn(
                  "id",
                  picks.map((pick) => pick.game_id)
               );
            const now = Date.now();
            const pickable_game_ids = games
               .filter((game) => game.game_at > now)
               .map((game) => game.id);

            const picks_to_save = picks.filter((pick) =>
               pickable_game_ids.includes(pick.game_id)
            );
            const rejected = picks
               .filter((pick) => !pickable_game_ids.includes(pick.game_id))
               .map((pick) => pick.game_id);

            // upsert all the picks together so they either all save or none do
            await mysqldb.transaction(async (trx) => {
               for (const pick of picks_to_save) {
                  await trx.raw(
                     "INSERT INTO `picks` SET `user_id` = ?, `game_id` = ?, `group_id` = ?, `pick` = ? ON DUPLICATE KEY UPDATE `pick` = VALUES(`pick`), `last_change_at` = UNIX_TIMESTAMP() * 1000;",
                     [user_id, pick.game_id, group_id, pick.pick]
                  );
               }
            });

            return res.status(200).json({
               saved: picks_to_save.map((pick) => pick.game_id),
               rejected, // game ids that have already started (or don't exist)
            });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
