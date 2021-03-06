const bcrypt = require("bcrypt");
const db = require("../db");
const selectUserByUserName = require("../queries/selectUserByUserName");
const selectUserIdByUserName = require("../queries/selectUserIdByUserName");

// this file is for short functions we will use throughout the app on the server side

module.exports = {
   // this converts rowpacket data
   toJson(data) {
      return JSON.stringify(data);
   },

   // safely parses without crashing the app
   toSafeParse(str) {
      try {
         JSON.parse(str);
      } catch (err) {
         console.log(err);
         return str;
      }
      return JSON.parse(str); // Could be undefined
   },

   // returns a hashed version of a given password
   toHash(myPlaintextPassword) {
      SALT_ROUNDS = 12;
      return bcrypt.hash(myPlaintextPassword, SALT_ROUNDS);
   },

   // returns true if a user has this user_name in the db, false if not
   checkIfUserNameExists(user_name) {
      console.log("checkIfUserNameExists()...", user_name);
      return db
         .query(selectUserByUserName, user_name)
         .then((users) => {
            if (users.length === 0) {
               return false;
            } else {
               console.log("user_name already in the db");
               return true;
            }
         })
         .catch((err) => {
            console.log("err", err);
         });
   },

   // returns the user id for an user_name or blank if there is no user
   getUserIdByUserName(user_name) {
      console.log("getUserIdByUserName()...", { user_name });
      return db
         .query(selectUserIdByUserName, user_name)
         .then((users) => {
            if (users.length === 0) {
               return "";
            } else {
               return users[0].id;
            }
         })
         .catch((err) => {
            console.log("err", err);
         });
   },

   // server side constants
   EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
   PHONE_REGEX: /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/, // https://regexlib.com Laurence O'Donnell
   TOKEN_EXPIRE_TIME: "3h",
};
