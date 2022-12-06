const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // To test in Postman:
      // Set the dropdown to PATCH
      // http://localhost:3000/api/games/update-score
      // put a name and password in Body tab under x-www-form-urlencoded
      if (req.method === "PATCH") {
         const user_id = req.user.id; // get the user id from the JWT
         const { game_id, away_score, home_score } = req.query; // grabbing variables from req.query

         mysqldb
            .select()
            .from("users")
            .where({ id: user_id })
            .then((users) => {
               if (users[0].is_admin === 1) {
                  // this user is an admin
                  mysqldb("games")
                     .where("id", game_id)
                     .update({
                        // this is so if you send empty values, it will put nulls into the db
                        away_score: away_score === "" ? null : away_score,
                        home_score: home_score === "" ? null : home_score,
                     })
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
