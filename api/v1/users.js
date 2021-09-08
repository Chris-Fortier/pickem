// The users resource
require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../db");
const insert_user = require("../../queries/insertUser");
const select_user_by_id = require("../../queries/selectUserById");
const select_user_by_user_name = require("../../queries/selectUserByUserName");
const delete_user = require("../../queries/deleteUser");
const set_user_user_name = require("../../queries/setUserUserName");
const set_user_email = require("../../queries/set_user_email");
const set_user_team_name = require("../../queries/setUserTeamName");
const set_user_initials = require("../../queries/setUserInitials");
const set_user_password = require("../../queries/setUserPassword");
const { toHash, TOKEN_EXPIRE_TIME } = require("../../utils/helpers");
const get_new_user_name_error = require("../../validation/getNewUserNameError");
const get_new_email_error = require("../../validation/get_new_email_error");
const get_new_team_name_error = require("../../validation/getNewTeamNameError");
const get_new_initials_error = require("../../validation/getNewInitialsError");
const get_new_password_error = require("../../validation/getNewPasswordError");
const get_current_user_name_error = require("../../validation/getCurrentUserNameError");
const get_current_password_error = require("../../validation/getCurrentPasswordError");
const jwt = require("jsonwebtoken");
const validate_jwt = require("../../utils/validateJwt");
const set_user_last_login_at = require("../../queries/setUserLastLoginAt");
const check_password_against_user_id = require("../../validation/checkPasswordAgainstUserId");
const uuid = require("uuid");

// @route      POST api/v1/users (going to post one thing to this list of things)
// @desc       Create a new user
// @access     Public
router.post("/", async (req, res) => {
   const { user_name, email, team_name, initials, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const new_user_name_error = await get_new_user_name_error(user_name);
   const new_email_error = await get_new_email_error(email);
   const new_team_name_error = await get_new_team_name_error(team_name);
   const new_initials_error = await get_new_initials_error(initials);
   const new_password_error = get_new_password_error(password);
   let dbError = ""; // this will store some text describing an error from the database

   // if there are no errors with user_name, team_name, initials and password:
   if (
      new_user_name_error === "" &&
      new_email_error === "" &&
      new_team_name_error === "" &&
      new_initials_error === "" &&
      new_password_error === ""
   ) {
      newUserId = uuid.v4(); // generate a uuid
      currentDateTime = Date.now();
      const user = {
         id: newUserId,
         user_name, // if the key and value are called the same, you can just have the key
         email,
         team_name,
         initials,
         password: await toHash(password), // hash the password (npm install bcrypt)
         created_at: currentDateTime,
         last_login_at: currentDateTime,
      };

      db.query(insert_user, user)
         .then((dbRes) => {
            // return the user data to we can put in redux store
            db.query(select_user_by_id, newUserId)
               .then((users) => {
                  // TODO: duplicated code
                  // what the user is
                  // the user is the first user in the array of 1 item (users[0])
                  const user = {
                     id: users[0].id,
                     user_name: users[0].user_name,
                     email: users[0].email,
                     team_name: users[0].team_name,
                     initials: users[0].initials,
                     created_at: users[0].created_at,
                     last_login_at: users[0].last_login_at,
                     this_login_at: currentDateTime,
                  };

                  // this contains the user, a secret and the timeframe
                  const accessToken = jwt.sign(
                     user,
                     process.env.JWT_ACCESS_SECRET
                     // {
                     //    expiresIn: TOKEN_EXPIRE_TIME,
                     // }
                  );

                  res.status(200).json({ accessToken });
               })
               .catch((err) => {
                  console.log("err", err);
                  dbError = `${err.code} ${err.sqlMessage}`; // format the database error
                  // return a 400 error to user
                  res.status(400).json({ dbError });
               });
         })
         .catch((err) => {
            console.log("err", err);
            dbError = `${err.code} ${err.sqlMessage}`; // format the database error
            // return a 400 error to user
            res.status(400).json({ dbError });
         });
   } else {
      // return a 400 error to user
      res.status(400).json({
         new_user_name_error,
         new_email_error,
         new_team_name_error,
         new_initials_error,
         new_password_error,
      });
   }
});

// @route      POST api/v1/users/auth
// @desc       Check this user against the db via user_name and password
// @access     Public
router.post("/auth", async (req, res) => {
   const { user_name, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const current_user_name_error = get_current_user_name_error(user_name);
   const current_password_error = await get_current_password_error(
      password,
      user_name
   );
   console.log({ current_user_name_error, current_password_error }); // this form of console logging makes it clear what it is
   let dbError = ""; // this will store some text describing an error from the database

   // if there are no errors
   if (current_user_name_error === "" && current_password_error == "") {
      // return the user to the client
      db.query(select_user_by_user_name, user_name)
         .then((users) => {
            // TODO: duplicated code
            // what the user is
            // the user is the first user in the array of 1 item (users[0])
            currentDateTime = Date.now();

            const user = {
               id: users[0].id,
               user_name: users[0].user_name,
               email: users[0].email,
               team_name: users[0].team_name,
               initials: users[0].initials,
               created_at: users[0].created_at,
               last_login_at: users[0].last_login_at,
               this_login_at: currentDateTime,
            };

            // this contains the user, a secret and the timeframe
            // 1m for testing, could be longer like 3h, 7d etc
            const accessToken = jwt.sign(
               user,
               process.env.JWT_ACCESS_SECRET
               //{expiresIn: TOKEN_EXPIRE_TIME,}
            );

            // enter new last login
            db.query(set_user_last_login_at, [currentDateTime, users[0].id])
               .then(() => {
                  res.status(200).json({ accessToken }); // instead of passing the user as the response, pass the access token
               })
               .catch((err) => {
                  res.status(400).json("error updating last login time");
               });
         })
         .catch((err) => {
            console.log("err", err);
            dbError = `${err.code} ${err.sqlMessage}`; // format the database error
            // return a 400 error to user
            res.status(400).json({ dbError });
         });
   } else {
      // return a 400 error to user
      res.status(400).json({ current_user_name_error, current_password_error });
   }
});

// @route      PUT api/v1/users/delete
// @desc       Delete an existing user
// @access     Private
// test:
router.put("/delete", validate_jwt, async (req, res) => {
   const { currentPassword } = req.body; // grabbing variable from req.body
   const userId = req.user.id; // get the user id from the JWT

   const current_password_error = await check_password_against_user_id(
      currentPassword,
      userId
   ); // check to see if the password submitted is correct

   if (current_password_error === "") {
      // if it gets this far, user_name can be changed

      db.query(delete_user, [userId])
         .then((dbRes) => {
            console.log("dbRes", dbRes);
            res.status(200).json("user deleted");
         })
         .catch((err) => {
            console.log("err", err);
            res.status(400).json(err);
         });
   } else {
      // return a 400 error to user
      console.log({ current_password_error });
      res.status(400).json({
         current_password_error,
      });
   }
});

// @route      PUT api/v1/users/set-user-name
// @desc       change a user_name
// @access     Private
// test:
router.put("/set-user-name", validate_jwt, async (req, res) => {
   // console.log("req.body", req.body);

   const { newUserName, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const new_user_name_error = await get_new_user_name_error(newUserName); // check to see if the new user_name is valid
   console.log({ new_user_name_error });
   const current_password_error = await check_password_against_user_id(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      new_user_name_error,
      current_password_error,
   });

   if (new_user_name_error === "" && current_password_error === "") {
      // if it gets this far, user_name can be changed
      console.log("user_name can be changed");
      // res.status(200).json("UserName can be changed");

      db.query(set_user_user_name, [newUserName, userId])
         .then((dbRes) => {
            console.log("dbRes", dbRes);
            res.status(200).json("user_name changed to " + newUserName);
         })
         .catch((err) => {
            console.log("err", err);
            res.status(400).json(err);
         });
   } else {
      // return a 400 error to user
      res.status(400).json({
         new_user_name_error,
         current_password_error,
      });
   }
});

// @route      PUT api/v1/users/set-email
// @desc       change an email
// @access     Private
// test:
router.put("/set-email", validate_jwt, async (req, res) => {
   const { new_email, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const new_email_error = await get_new_email_error(new_email); // check to see if the new email is valid
   console.log({ new_email_error });
   const current_password_error = await check_password_against_user_id(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      new_email_error,
      current_password_error,
   });

   if (new_email_error === "" && current_password_error === "") {
      // if it gets this far, email can be changed

      db.query(set_user_email, [new_email, userId])
         .then((dbRes) => {
            console.log("dbRes", dbRes);
            res.status(200).json("email changed to " + new_email);
         })
         .catch((err) => {
            console.log("err", err);
            res.status(400).json(err);
         });
   } else {
      // return a 400 error to user
      res.status(400).json({
         new_email_error,
         current_password_error,
      });
   }
});

// @route      PUT api/v1/users/set-team-name
// @desc       change a user's team name
// @access     Private
// test:
router.put("/set-team-name", validate_jwt, async (req, res) => {
   const { newTeamName, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   const new_team_name_error = await get_new_team_name_error(newTeamName); // check to see if the new team name is valid
   const current_password_error = await check_password_against_user_id(
      password,
      userId
   ); // check to see if the password submitted is correct

   if (new_team_name_error === "" && current_password_error === "") {
      // if it gets this far, team name can be changed

      db.query(set_user_team_name, [newTeamName, userId])
         .then((dbRes) => {
            console.log("dbRes", dbRes);
            res.status(200).json("team name changed to " + newTeamName);
         })
         .catch((err) => {
            console.log("err", err);
            res.status(400).json(err);
         });
   } else {
      // return a 400 error to user
      res.status(400).json({
         new_team_name_error,
         current_password_error,
      });
   }
});

// @route      PUT api/v1/users/set-initials
// @desc       change a user's initials
// @access     Private
// test:
router.put("/set-initials", validate_jwt, async (req, res) => {
   const { newInitials, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const new_initials_error = await get_new_initials_error(newInitials); // check to see if the new initials is valid
   console.log({ new_initials_error });
   const current_password_error = await check_password_against_user_id(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      new_initials_error,
      current_password_error,
   });

   if (new_initials_error === "" && current_password_error === "") {
      // if it gets this far, initials can be changed
      console.log("initials can be changed");

      db.query(set_user_initials, [newInitials, userId])
         .then((dbRes) => {
            console.log("dbRes", dbRes);
            res.status(200).json("initials changed to " + newInitials);
         })
         .catch((err) => {
            console.log("err", err);
            res.status(400).json(err);
         });
   } else {
      // return a 400 error to user
      res.status(400).json({
         new_initials_error,
         current_password_error,
      });
   }
});

// @route      PUT api/v1/users/set-password
// @desc       change a password
// @access     Private
// test:
router.put("/set-password", validate_jwt, async (req, res) => {
   const { currentPassword, newPassword } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   const current_password_error = await check_password_against_user_id(
      currentPassword,
      userId
   ); // check to see if the currentPassword submitted is correct
   const new_password_error = await get_new_password_error(newPassword); // check to see if the newPassword submitted is gtg
   let message_from_server = "";
   let resStatus = 200;

   // if there are no errors, change the password
   if (current_password_error === "" && new_password_error === "") {
      // if it gets this far, password can be changed

      db.query(set_user_password, [await toHash(newPassword), userId])
         .then((dbRes) => {
            resStatus = 200;
            message_from_server = "Your password was changed.";
            sendResponse();
         })
         .catch((err) => {
            resStatus = 400;
            message_from_server = "There was an error on the server.";
            sendResponse();
         });
   } else {
      // return error to user
      resStatus = 400;
      sendResponse();
   }

   // finally send the response which is a list of errors or a success message
   // made this a function to ensure it happens last when I call it inside thens and catches
   function sendResponse() {
      console.log(resStatus, {
         current_password_error,
         new_password_error,
         message_from_server,
      });
      res.status(resStatus).json({
         current_password_error,
         new_password_error,
         message_from_server,
      });
   }
});
module.exports = router;
