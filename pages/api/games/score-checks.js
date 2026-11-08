const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");

const NUM_SCORE_CHECKS = 20;

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to get the most recent checks of ESPN's scores, automatic and manual, newest first
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/score-checks
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "GET") {
         const user_id = req.user.id; // get the user id from the JWT

         try {
            const users = await mysqldb
               .select("is_admin")
               .from("users")
               .where({ id: user_id });
            if (!users.length || users[0].is_admin !== 1) {
               return res.status(400).json("This user is not an admin.");
            }

            const score_checks = await mysqldb
               .select(
                  "score_checks.id",
                  "score_checks.checked_at",
                  "score_checks.season",
                  "score_checks.week",
                  "score_checks.check_type",
                  "score_checks.num_filled",
                  "score_checks.details",
                  "score_checks.error",
                  "users.team_name",
                  "users.user_name"
               )
               .from("score_checks")
               .leftJoin("users", "score_checks.user_id", "users.id")
               .orderBy("score_checks.checked_at", "desc")
               .limit(NUM_SCORE_CHECKS);

            return res.status(200).json(
               score_checks.map((score_check) => ({
                  ...score_check,
                  // the database driver gives JSON columns back as strings
                  details:
                     typeof score_check.details === "string"
                        ? JSON.parse(score_check.details)
                        : score_check.details,
               }))
            );
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
