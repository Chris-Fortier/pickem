const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const { get_jwt } = require("../../../utils/helpers");
const get_current_user_name_error = require("../../../validation/get_current_user_name_error");
const get_current_password_error = require("../../../validation/get_current_password_error");

export default async (req, res) => {
   // To test in Postman:
   // Set the dropdown to POST
   // http://localhost:3000/api/users/auth
   // put a name and password in Body tab under x-www-form-urlencoded
   if (req.method === "POST") {
      const { name, password } = req.body;

      const current_user_name_error = get_current_user_name_error(name);
      const current_password_error = await get_current_password_error(
         password,
         name
      );

      // if there are no errors
      if (current_user_name_error === "" && current_password_error == "") {
         // update last log in and last activity times
         const current_date_time = Date.now();
         mysqldb("users")
            .where({ user_name: name })
            .update({
               last_login_at: current_date_time,
               // last_activity_at: current_date_time,
            })
            .then(() => {
               // return an access token
               mysqldb
                  .select()
                  .from("users")
                  .where({ user_name: name })
                  .then((users) => {
                     res.status(200).json({ access_token: get_jwt(users[0]) }); // return the access_token
                  })
                  .catch((err) => {
                     res.status(400).json(err);
                  });
            })
            .catch((err) => {
               res.status(400).json(err);
            });
      } else {
         // return the errors to the client so it can display messages
         res.status(400).json({
            current_user_name_error,
            current_password_error,
         });
      }
   }
};
