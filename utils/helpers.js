const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const knex = require("knex");
const config = require("../knexfile");
const mysqldb = knex(config);

// this file is for short functions we will use throughout the app on the server side

module.exports = {
   // returns a hashed version of a given plain text string
   get_hash(plain_text) {
      const SALT_ROUNDS = 12;
      return bcrypt.hash(plain_text, SALT_ROUNDS);
   },

   // returns true if an existing user has the given where_clause {key: value}, false if not
   check_if_existing_user_has_key_with_value(where_clause) {
      return mysqldb
         .select()
         .from("users")
         .where(where_clause)
         .then((users) => {
            if (users.length === 0) {
               return false;
            } else {
               console.log("An existing user has this key: value combination");
               return true;
            }
         })
         .catch((err) => {
            console.log("err", err);
         });
   },

   // returns json web token for a given user
   get_jwt(user) {
      const new_user = { id: user.id, created_at: user.created_at }; // only store user values that cannot change in the jwt so the jwt is never out of sync with other other properties
      return jwt.sign(new_user, process.env.JWT_ACCESS_SECRET, {
         expiresIn: "100 years",
      });
   },

   // server side constants
   EMAIL_REGEX:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

   get_human_readable_duration(milliseconds) {
      const seconds = milliseconds / 1000;
      if (seconds < 10) {
         return seconds.toFixed(1) + " seconds";
      }
      if (seconds < 60) {
         return seconds.toFixed(0) + " seconds";
      }
      const minutes = seconds / 60;
      if (minutes < 10) {
         return minutes.toFixed(1) + " minutes";
      }
      if (minutes < 60) {
         return minutes.toFixed(0) + " minutes";
      }
      const hours = minutes / 60;
      if (hours < 24) {
         return hours.toFixed(1) + " hours";
      }
      const days = hours / 24;
      if (days < 7) {
         return days.toFixed(1) + " days";
      }
      const weeks = days / 7;
      if (weeks < 4) {
         return weeks.toFixed(1) + " weeks";
      }
      const months = days / 30;
      if (months < 12) {
         return months.toFixed(1) + " months";
      }
      const years = days / 365;
      if (years < 10) {
         return years.toFixed(1) + " years";
      }
      return years.toFixed(0) + " years";
   },

   // gets a new next_ask_at
   get_next_ask_at({
      is_correct,
      next_ask_at,
      last_asked_at,
      num_correct,
      num_incorrect,
      current_datetime = Date.now(),
   }) {
      const previous_target_delay = next_ask_at - last_asked_at;
      const previous_actual_delay = current_datetime - last_asked_at;
      const correct_percentage = num_correct / (num_correct + num_incorrect);
      let new_target_delay;
      if (is_correct) {
         if (current_datetime < next_ask_at) {
            // if this response was set too soon, just reset the existing delay
            new_target_delay = previous_target_delay;
         } else {
            new_target_delay = previous_actual_delay * (1 + correct_percentage);
         }
      } else {
         new_target_delay = previous_target_delay / 2;
      }
      const new_next_ask_at = current_datetime + new_target_delay;
      // console.log({
      //   is_correct,
      //   previous_last_asked_at: last_asked_at,
      //   previous_next_ask_at: next_ask_at,
      //   num_correct,
      //   num_incorrect,
      //   correct_percentage,
      //   current_datetime,
      //   previous_target_delay,
      //   previous_actual_delay,
      //   new_target_delay,
      //   new_next_ask_at,
      // });
      // log this to create tests
      // console.log({
      //   arguments: { is_correct, next_ask_at, last_asked_at, current_datetime },
      //   expected_result: new_next_ask_at,
      // });
      return new_next_ask_at;
   },
};
