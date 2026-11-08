const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
import {
   get_source_scores,
   check_and_fill_scores,
} from "../../../utils/score_checks";

const get_season_week = (params) => {
   const season = parseInt(params.season);
   const week = parseInt(params.week);
   return isNaN(season) || isNaN(week) || week < 1 ? null : { season, week };
};

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      const user_id = req.user.id; // get the user id from the JWT

      const is_admin = async () => {
         const users = await mysqldb
            .select("is_admin")
            .from("users")
            .where({ id: user_id });
         return users.length > 0 && users[0].is_admin === 1;
      };

      // used to compare our scores for a week with ESPN's final scores, to find scores to fill in
      // nothing is changed here, it just returns what would change
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/source-scores?season=2025&week=8
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "GET") {
         const season_week = get_season_week(req.query);
         if (!season_week) {
            return res.status(400).json("A season and week are required.");
         }

         try {
            if (!(await is_admin())) {
               return res.status(400).json("This user is not an admin.");
            }

            let result;
            try {
               result = await get_source_scores(
                  mysqldb,
                  season_week.season,
                  season_week.week
               );
            } catch (err) {
               console.log(err);
               return res
                  .status(502)
                  .json("Could not get the scores from ESPN.");
            }

            return res.status(200).json(result);
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }

      // used to fill in the missing scores for a week from ESPN's final scores, and record it as a manual check
      // saved scores are never changed
      // To test in Postman:
      // Set the dropdown to POST
      // http://localhost:3000/api/games/source-scores
      // in the Body tab choose raw JSON: { "season": 2025, "week": 8 }
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "POST") {
         const season_week = get_season_week(req.body || {});
         if (!season_week) {
            return res.status(400).json("A season and week are required.");
         }

         try {
            if (!(await is_admin())) {
               return res.status(400).json("This user is not an admin.");
            }

            const { filled, error } = await check_and_fill_scores(mysqldb, {
               ...season_week,
               check_type: "manual",
               user_id,
            });
            if (error) {
               return res
                  .status(502)
                  .json("Could not get the scores from ESPN.");
            }

            return res.status(200).json({ filled });
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
