const knex = require("knex");
const config = require("../knexfile");
const mysqldb = knex(config);
const bcrypt = require("bcrypt");

module.exports = async function get_current_password_error(password, name) {
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   return await check_is_valid_user(name, password);
};

function check_is_valid_user(name, password) {
   // get the user by name
   // compare user.password with password

   return mysqldb("users")
      .select()
      .where({ user_name: name })
      .then(async (users) => {
         // console.log("users", users);
         if (users.length > 0) {
            const user = users[0];
            const is_valid_user = await bcrypt.compare(password, user.password); // compare the password with the hashed password in the database
            if (is_valid_user) {
               // user and password match
               return "";
            } else {
               // user exists but wrong password
               return "The user name and/or password you entered is invalid.";
            }
         } else {
            // This user doesn't exist
            return "The user name and/or password you entered is invalid.";
         }
      })
      .catch((err) => {
         console.log("err2", err);
         return "There was a problem with the server connecting to the database.";
      });
}
