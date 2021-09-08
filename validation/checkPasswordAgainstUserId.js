const db = require("../db");
const select_user_by_id = require("../queries/selectUserById");
const bcrypt = require("bcrypt");
// const { toHash } = require("../utils/helpers");

// this checks if its the correct password for the userId, it takes a hashed password
module.exports = async function check_password_against_user_id(
   password,
   userId
) {
   console.log("check_password_against_user_id()...");
   console.log({ password, userId });
   if (password === undefined) {
      // check if password input is blank
      return "Your password is undefined.";
   }
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   if ((await check_password(userId, password)) === false) {
      return "The password you entered is not correct for this user.";
   }
   return "";
};

function check_password(userId, password) {
   // get the user by userId
   // compare user.password with password
   // if a match, return true, else false
   return db
      .query(select_user_by_id, userId)
      .then(async (users) => {
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
