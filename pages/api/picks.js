const knex = require("knex");
const config = require("../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../utils/validate_jwt");

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/picks
      // put a name and password in Body tab under x-www-form-urlencoded
      if (req.method === "GET") {
         const user_id = req.user.id; // get the user id from the JWT
         const {
            // group_id,
            season,
            week,
         } = req.query; // grabbing variables from req.query

         mysqldb
            .raw(
               `SELECT \`game_at\`, \`away_team\`, \`home_team\`, \`games\`.\`id\` AS \`game_id\`, '${"3fd8d78c-8151-4145-b276-aea3559deb76"}' AS \`group_id\`, \`pick\`, (CASE WHEN \`away_score\` > \`home_score\` THEN 0 WHEN  \`away_score\` < \`home_score\` THEN 1 WHEN \`away_score\` = \`home_score\` THEN 2 ELSE NULL END) AS \`winner\` FROM \`picks\` RIGHT JOIN \`games\` ON \`games\`.\`id\` = \`picks\`.\`game_id\` AND \`user_id\` = '${user_id}' WHERE \`season\` = ${season} AND \`week\` LIKE '${week}' ORDER BY \`game_at\` ASC;`
            )
            .then((picks) => {
               return res.status(200).json(picks[0]);
            })
            .catch((err) => {
               // report error
               console.log(err);
               return res.status(400).json(err);
            });
      }

      if (req.method === "PUT") {
         const user_id = req.user.id; // get the user id from the JWT
         const { game_id, group_id, pick } = req.query; // grabbing variables from req.query

         // handle null sent from client which is what happens when the user cancels a pick
         let new_pick = pick;
         if (pick === "null") {
            new_pick = null;
         }

         // make sure that this game hasn't already started
         mysqldb
            .select("game_at")
            .from("games")
            .where("id", game_id)
            .then((game) => {
               if (game[0].game_at > Date.now()) {
                  // game starts in future

                  // upsert the pick
                  mysqldb
                     .raw(
                        `
                  INSERT INTO \`pickem_app\`.\`picks\` 
                  SET 
                      \`user_id\` = '${user_id}',
                      \`game_id\` = '${game_id}',
                      \`group_id\` = '${group_id}',
                      \`pick\` = ${new_pick}
                  ON DUPLICATE KEY UPDATE \`pick\` = ${new_pick}, \`last_change_at\` = UNIX_TIMESTAMP() * 1000;
                  `
                     )
                     .then((db_res) => {
                        console.log("pick made");
                        return res.status(200).json(db_res);
                     })
                     .catch((err) => {
                        // report error
                        console.log(err);
                        return res.status(400).json(err);
                     });
               } else {
                  // 'game starts in past'
                  return res
                     .status(400)
                     .json(
                        "You cannot set your pick as this game's scheduled start has already happened."
                     );
               }
            });
      }
   });
};
