const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();

export default async (req, res) => {
   // used to get the team names and initials for a list of user ids
   // To test in Postman:
   // Set the dropdown to GET
   // http://localhost:3000/api/users/team-names?ids=id1,id2
   if (req.method === "GET") {
      const ids = (req.query.ids || "").split(",").filter((id) => id);

      if (!ids.length) {
         return res.status(200).json([]);
      }

      mysqldb
         .select("id", "team_name", "initials")
         .from("users")
         .whereIn("id", ids)
         .then((users) => {
            return res.status(200).json(users);
         })
         .catch((err) => {
            console.log(err);
            return res.status(400).json(err);
         });
   }
};
