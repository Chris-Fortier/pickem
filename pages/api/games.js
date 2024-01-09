const knex = require("knex");
const config = require("../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../utils/validate_jwt");
const uuid = require("uuid");

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games
      if (req.method === "GET") {
         // read games

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

      if (req.method === "POST") {
         // create a game

         const user_id = req.user.id; // get the user id from the JWT
         const body = req.body; // grabbing variables from req.query

         if (body.new_game.away_team === body.new_game.home_team) {
            return res.status(400).json({
               message: "A game must have two different teams.",
            });
         } else {
            mysqldb
               .select()
               .from("users")
               .where({ id: user_id })
               .then((users) => {
                  if (users[0].is_admin === 1) {
                     // this user is an admin
                     const new_game_id = uuid.v4();
                     mysqldb("games")
                        .select()
                        .where({
                           season: body.new_game.season,
                           week: body.new_game.week,
                           away_team: body.new_game.away_team,
                        })
                        .orWhere({
                           season: body.new_game.season,
                           week: body.new_game.week,
                           away_team: body.new_game.home_team,
                        })
                        .orWhere({
                           season: body.new_game.season,
                           week: body.new_game.week,
                           home_team: body.new_game.away_team,
                        })
                        .orWhere({
                           season: body.new_game.season,
                           week: body.new_game.week,
                           home_team: body.new_game.home_team,
                        })
                        .then((existing_games) => {
                           if (existing_games.length) {
                              return res.status(400).json({
                                 message:
                                    "A game this week with this team already exists.",
                              });
                           } else {
                              mysqldb("games")
                                 .insert({ id: new_game_id, ...body.new_game })
                                 .then(() => {
                                    // return a success message
                                    return res.status(200).json({
                                       message: "Game added.",
                                       new_game_id,
                                    });
                                 })
                                 .catch((err) => {
                                    // return the error
                                    return res.status(400).json(err);
                                 });
                           }
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
      }

      if (req.method === "PATCH") {
         // update a game
         // TODO: could use this call for updating scores as well

         const user_id = req.user.id; // get the user id from the JWT
         const body = req.body; // grabbing variables from req.query

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

      if (req.method === "DELETE") {
         // delete a game

         const user_id = req.user.id; // get the user id from the JWT
         const game_id = req.query.game_id; // grabbing variables from req.query

         mysqldb
            .select()
            .from("users")
            .where({ id: user_id })
            .then((users) => {
               if (users[0].is_admin === 1) {
                  // this user is an admin
                  mysqldb("games")
                     .where("id", game_id)
                     .delete()
                     .then(() => {
                        // return a success message
                        return res.status(200).json("Game deleted.");
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
