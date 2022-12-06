const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
const { get_hash, get_jwt } = require("../../../utils/helpers");
const get_new_user_name_error = require("../../../validation/get_new_user_name_error");
const get_new_email_error = require("../../../validation/get_new_email_error");
const get_new_password_error = require("../../../validation/get_new_password_error");
const check_password_against_user_id = require("../../../validation/check_password_against_user_id");

export default async (req, res) => {
   // used to retrieve the properties of a single user
   // To test in Postman:
   // Set the dropdown to GET
   // http://localhost:3000/api/users
   // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
   if (req.method === "GET") {
      validate_jwt(req, res, () => {
         const user_id = req.user.id; // get the user is from the provided jwt
         // TODO: update last activity time?
         mysqldb
            .select()
            .from("users")
            .where({ id: user_id }) // get the user where the id matches the one in the provided jwt
            .then((users) => {
               const user = { ...users[0] };
               delete user.password; // do not return the password in the user object
               return res.status(200).json(user);
            })
            .catch((err) => {
               console.log("error");
               return res.status(400).json(err);
            });
      });
   }
   // used to create a new user
   // To test in Postman:
   // Set the dropdown to POST
   // http://localhost:3000/api/users
   // put a name, password and email in Body tab under x-www-form-urlencoded
   // TODO: temporarily disabling making of new accounts from the FE
   if (req.method === "POST") {
      res.status(400).json({
         new_user_name_error: "Account creation is temporarily disabled.",
         new_email_error: "Account creation is temporarily disabled.",
         new_password_error: "Account creation is temporarily disabled.",
      });
   }

   // eslint-disable-next-line
   if (false) {
      const submission = req.body;

      const { name, email, password } = req.body;

      const new_user_name_error = await get_new_user_name_error(name);
      const new_email_error = await get_new_email_error(email);
      const new_password_error = get_new_password_error(password);

      // if there are no errors with name, password and email:
      if (
         new_user_name_error === "" &&
         new_email_error === "" &&
         new_password_error === ""
      ) {
         // add the new user to the database
         const new_user = {
            ...submission,
            password: await get_hash(password),
            is_admin: 0, // make sure this new user is not an admin regardless of what was sent to api (admin must be made manually directly in the DB)
         };
         mysqldb("users")
            .insert(new_user)
            .then(() => {
               // return an access token
               // TODO: this is largely duplicated code
               mysqldb
                  .select()
                  .from("users")
                  .where({ name })
                  .then((users) => {
                     res.status(200).json({ access_token: get_jwt(users[0]) }); // return the access_token
                  })
                  .catch((err) => {
                     res.status(400).json(err);
                  });
            });
      } else {
         // return the errors to the client so it can display messages
         res.status(400).json({
            new_user_name_error,
            new_email_error,
            new_password_error,
         });
      }
   }
   // used to delete a user
   // To test in Postman:
   // Set the dropdown to DELETE
   // http://localhost:3000/api/users
   // put the password in Body tab under x-www-form-urlencoded
   // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
   if (req.method === "DELETE") {
      validate_jwt(req, res, async () => {
         const user_id = req.user.id; // get the user is from the provided jwt

         const { current_password } = req.body;

         const current_password_error = await check_password_against_user_id(
            user_id, // id from JWT
            current_password
         );

         // if there are no errors with the password:
         if (current_password_error === "") {
            mysqldb("users")
               .where({ id: user_id })
               .del()
               .then(() => {
                  res.status(200).json("account deleted");
               })
               .catch((err) => {
                  res.status(400).json(err);
               });
            // TODO: should also delete data from other tables owned by this user (can set this up in the database)
         } else {
            // return the errors to the client so it can display messages
            res.status(400).json({
               current_password_error,
            });
         }
      });
   }
};
