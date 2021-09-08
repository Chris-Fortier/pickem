const db = require("../db");
const selectUserById = require("../queries/selectUserById");
const bcrypt = require("bcrypt");
// const { toHash } = require("../utils/helpers");

// this checks if its the correct password for the userId, it takes a hashed password
module.exports = async function checkPasswordAgainstUserId(password, userId) {
   console.log("checkPasswordAgainstUserId()...");
   console.log({ password, userId });
   if (password === undefined) {
      // check if password input is blank
      return "Your password is undefined.";
   }
   if (password === "") {
      // check if password input is blank
      return "Please enter your password.";
   }
   if ((await checkPassword(userId, password)) === false) {
      return "The password you entered is not correct for this user.";
   }
   return "";
};

function checkPassword(userId, password) {
   // get the user by userId
   // compare user.password with password
   // if a match, return true, else false
   return db
      .query(selectUserById, userId)
      .then(async (users) => {
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
