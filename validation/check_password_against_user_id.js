const knex = require("knex");
const config = require("../knexfile");
const mysqldb = knex(config);
const bcrypt = require("bcrypt");

// this checks if its the correct password for the user_id
module.exports = async function check_password_against_user_id(id, password) {
   if (password === undefined) {
      // check if password input is blank
      return "Your password is undefined.";
   }
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   // get the user by id
   // compare user.password with password
   // if a match, return true, else false
   return await mysqldb("users")
      .select()
      .where({ id })
      .then(async (users) => {
         if (users.length > 0) {
            const user = users[0];
            // compares the password with the hashed password in the database
            return await bcrypt
               .compare(password, user.password)
               .then((is_valid_user) => {
                  console.log("is_valid_user", is_valid_user);
                  return is_valid_user
                     ? ""
                     : "The password you entered is not correct for this user.";
               })
               .catch((err) => {
                  console.log("err", err);
               });
         } else {
            return "This user does not exist.";
         }
      })
      .catch((err) => {
         console.log("err", err);
         return "Something went wrong with the database.";
      });
};
