const db = require("../db");
const selectUserByUserName = require("../queries/selectUserByUserName");
const bcrypt = require("bcrypt");

module.exports = async function getSignUpPasswordError(password, user_name) {
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   if ((await checkIsValidUser(user_name, password)) === false) {
      return "The user_name and/or password you entered is invalid.";
   }
   return "";
};

function checkIsValidUser(user_name, password) {
   // get the user by user_name
   // compare user.password with password
   // if a match, return true, else false
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
