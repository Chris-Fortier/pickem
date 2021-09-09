const bcrypt = require("bcrypt");
const db = require("../db");
const select_user_id_by_user_name = require("../queries/select_user_id_by_user_name");
const knex = require("knex");
const config = require("../knexfile");
const mysqldb = knex(config);

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

   // returns true if an existing user has the given where_clause {key: value}, false if not
   check_if_existing_user_has_key_with_value(where_clause) {
      console.log(
         "check_if_existing_user_has_key_with_value()...",
         where_clause
      );

      return mysqldb
         .select()
         .from("users")
         .where(where_clause)
         .then((users) => {
            if (users.length === 0) {
               return false;
            } else {
               console.log("A user already has this key: value combination");
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
         .query(select_user_id_by_user_name, user_name)
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
   EMAIL_REGEX:
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
   PHONE_REGEX: /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/, // https://regexlib.com Laurence O'Donnell
   TOKEN_EXPIRE_TIME: "3h",
};
