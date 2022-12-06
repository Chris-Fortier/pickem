const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();

export default async (req, res) => {
   // To test in Postman:
   // Set the dropdown to GET
   // http://localhost:3000/api/games
   if (req.method === "GET") {
      const { season, week } = req.query; // grabbing variables from req.query

      // determine if we only want data for a specific week or the entire season
      const where_args = { season };
      if (week !== "%") {
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
};
