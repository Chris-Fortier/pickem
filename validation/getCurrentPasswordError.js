const db = require("../db");
const selectUserByUserName = require("../queries/selectUserByUserName");
const bcrypt = require("bcrypt");

module.exports = async function getCurrentPasswordError(password, user_name) {
   console.log("getCurrentPasswordError()...");
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   if (await checkIsValidUser(user_name, password)) {
      return "";
   }
   return "The user name and/or password you entered is invalid.";
};

function checkIsValidUser(user_name, password) {
   // get the user by user_name
   // compare user.password with password
   // if a match, return true, else false
   console.log("checkIsValidUser()...");
   return db
      .query(selectUserByUserName, user_name)
      .then(async (users) => {
         // console.log("users", users);
         const user = users[0];
         // compares the hashed password with the hashed password in the database
         const isValidUser = await bcrypt
            .compare(password, user.password)
            .then((isValidUser) => {
               console.log("isValidUser", isValidUser);
               return isValidUser;
               // every .then should have a return inside and be followed by a .catch
            })
            .catch((err) => {
               console.log("err", err);
            });
         return isValidUser; // we put this on its own line so we know what we are returning
      })
      .catch((err) => {
         console.log("err", err);
         const isValidUser = false;
         return isValidUser;
      });
}
