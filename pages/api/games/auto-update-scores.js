const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
import {
   get_weeks_needing_scores,
   is_auto_check_allowed,
   claim_auto_check,
   check_and_fill_scores,
} from "../../../utils/score_checks";

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // called when any user loads a page, so the scores are filled in from ESPN without an admin
      // it only ever fills in missing final scores, so it is safe for any user to call

      // used to find out if a check is due, so the page can show a message while it checks
      // a check is due if a game started 2.5 hours to 3 days ago and doesn't have a score, and there hasn't been a check in the last 10 minutes
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/auto-update-scores
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "GET") {
         try {
            const weeks = await get_weeks_needing_scores(mysqldb);
            const is_due =
               weeks.length > 0 && (await is_auto_check_allowed(mysqldb));
            return res.status(200).json({ is_due });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }

      // used to do a due check, filling in the missing scores of each week that needs them
      // To test in Postman:
      // Set the dropdown to POST
      // http://localhost:3000/api/games/auto-update-scores
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "POST") {
         const user_id = req.user.id; // get the user id from the JWT

         try {
            const weeks = await get_weeks_needing_scores(mysqldb);
            // the claim makes sure only one user does the check, even if they load pages at the same time
            if (!weeks.length || !(await claim_auto_check(mysqldb))) {
               return res.status(200).json({ is_checked: false, num_filled: 0 });
            }

            let num_filled = 0;
            for (const { season, week } of weeks) {
               const { filled } = await check_and_fill_scores(mysqldb, {
                  season,
                  week,
                  check_type: "auto",
                  user_id,
               });
               num_filled += filled.length;
            }

            return res.status(200).json({ is_checked: true, num_filled });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
