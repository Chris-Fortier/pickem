const knex = require("knex");
const config = require("../knexfile");
const mysqldb = knex(config);
const check_password_against_user_id = require("../validation/check_password_against_user_id");
const validate_jwt = require("./validate_jwt");
const { get_hash } = require("../utils/helpers");

module.exports = async function validate_and_change_user_property({
   req,
   res,
   property,
   validation_function,
   is_hashing = false, // set to true for things that need to be hashed for storage such as passwords
}) {
   // validate jwt first, then call the api
   validate_jwt(req, res, async () => {
      if (req.method === "PATCH") {
         const { new_value, current_password } = req.body;

         const new_value_error = await validation_function(new_value);
         const current_password_error = await check_password_against_user_id(
            req.user.id, // id from JWT
            current_password
         );

         // if there are no errors with property, password:
         if (new_value_error === "" && current_password_error === "") {
            // update the user property
            const updates = {
               // last_activity_at: Date.now(), // update last activity time for this user
            };
            if (is_hashing) {
               updates[property] = await get_hash(new_value);
            } else {
               updates[property] = new_value;
            }
            mysqldb("users")
               .where({ id: req.user.id })
               .update(updates)
               .then(() => {
                  // return the empty errors and message to the client
                  res.status(200).json({
                     new_value_error,
                     current_password_error,
                     // return appropriate message
                     message: is_hashing
                        ? `User ${property} changed.` // don't display value if it is a hashed one
                        : new_value !== ""
                        ? `User ${property} changed to ${new_value}.`
                        : `User ${property} removed.`,
                  });
               });
         } else {
            // return the errors to the client so it can display messages
            res.status(400).json({
               new_value_error,
               current_password_error,
               message: "There are errors with your submission.",
            });
         }
      }
   });
};
