const db = require("../db");
const select_user_by_user_name = require("../queries/selectUserByUserName");
const bcrypt = require("bcrypt");

module.exports = async function get_current_password_error(
   password,
   user_name
) {
   console.log("get_current_password_error()...");
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   if (await check_is_valid_user(user_name, password)) {
      return "";
   }
   return "The user name and/or password you entered is invalid.";
};

function check_is_valid_user(user_name, password) {
   // get the user by user_name
   // compare user.password with password
   // if a match, return true, else false
   console.log("check_is_valid_user()...");
   return db
      .query(select_user_by_user_name, user_name)
      .then(async (users) => {
         // console.log("users", users);
         const user = users[0];
         // compares the hashed password with the hashed password in the database
         const is_valid_user = await bcrypt
            .compare(password, user.password)
            .then((is_valid_user) => {
               console.log("is_valid_user", is_valid_user);
               return is_valid_user;
               // every .then should have a return inside and be followed by a .catch
            })
            .catch((err) => {
               console.log("err", err);
            });
         return is_valid_user; // we put this on its own line so we know what we are returning
      })
      .catch((err) => {
         console.log("err", err);
         const is_valid_user = false;
         return is_valid_user;
      });
}
