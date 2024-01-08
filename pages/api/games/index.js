const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games
      if (req.method === "GET") {
         const { season, week } = req.query; // grabbing variables from req.query

         // determine if we only want data for a specific week or the entire season
         const where_args = { season };
         if (week !== "all") {
            where_args.week = week;
         }

         mysqldb
            .select()
            .from("games")
            .where(where_args)
            .orderBy("game_at", "asc")
            .then((games) => {
               return res.status(200).json(games);
            })
            .catch((err) => {
               // report error
               console.log(err);
               return res.status(400).json(err);
            });
      }

      if (req.method === "PATCH") {
         const user_id = req.user.id; // get the user id from the JWT
         const body = req.body; // grabbing variables from req.query

         console.log({ user_id, body });

         mysqldb
            .select()
            .from("users")
            .where({ id: user_id })
            .then((users) => {
               if (users[0].is_admin === 1) {
                  // this user is an admin
                  mysqldb("games")
                     .where("id", body.game_id)
                     .update(body.updates)
                     .then(() => {
                        // return a success message
                        return res.status(200).json("Game updated.");
                     })
                     .catch((err) => {
                        // return the error
                        return res.status(400).json(err);
                     });
               } else {
                  // this user is not an admin
                  return res.status(400).json("This user is not an admin.");
               }
            })
            .catch((err) => {
               console.log("err", err);
            });
      }
   });
};
