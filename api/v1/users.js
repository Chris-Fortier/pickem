// The users resource
require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../db");
const insertUser = require("../../queries/insertUser");
const selectUserById = require("../../queries/selectUserById");
const selectUserByUserName = require("../../queries/selectUserByUserName");
const deleteUser = require("../../queries/deleteUser");
const setUserUserName = require("../../queries/setUserUserName");
const set_user_email = require("../../queries/set_user_email");
const setUserTeamName = require("../../queries/setUserTeamName");
const setUserInitials = require("../../queries/setUserInitials");
const setUserPassword = require("../../queries/setUserPassword");
const { toHash, TOKEN_EXPIRE_TIME } = require("../../utils/helpers");
const getNewUserNameError = require("../../validation/getNewUserNameError");
const get_new_email_error = require("../../validation/get_new_email_error");
const getNewTeamNameError = require("../../validation/getNewTeamNameError");
const getNewInitialsError = require("../../validation/getNewInitialsError");
const getNewPasswordError = require("../../validation/getNewPasswordError");
const getCurrentUserNameError = require("../../validation/getCurrentUserNameError");
const getCurrentPasswordError = require("../../validation/getCurrentPasswordError");
const jwt = require("jsonwebtoken");
const validateJwt = require("../../utils/validateJwt");
const setUserLastLoginAt = require("../../queries/setUserLastLoginAt");
const checkPasswordAgainstUserId = require("../../validation/checkPasswordAgainstUserId");
const uuid = require("uuid");

// @route      POST api/v1/users (going to post one thing to this list of things)
// @desc       Create a new user
// @access     Public
router.post("/", async (req, res) => {
   const { user_name, email, team_name, initials, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const new_username_error = await getNewUserNameError(user_name);
   const new_email_error = await get_new_email_error(email);
   const newTeamNameError = await getNewTeamNameError(team_name);
   const newInitialsError = await getNewInitialsError(initials);
   const newPasswordError = getNewPasswordError(password);
   let dbError = ""; // this will store some text describing an error from the database

   // if there are no errors with user_name, team_name, initials and password:
   if (
      new_username_error === "" &&
      new_email_error === "" &&
      newTeamNameError === "" &&
      newInitialsError === "" &&
      newPasswordError === ""
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

      db.query(insertUser, user)
         .then((dbRes) => {
            // return the user data to we can put in redux store
            db.query(selectUserById, newUserId)
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
         new_username_error,
         new_email_error,
         newTeamNameError,
         newInitialsError,
         newPasswordError,
      });
   }
});

// @route      POST api/v1/users/auth
// @desc       Check this user against the db via user_name and password
// @access     Public
router.post("/auth", async (req, res) => {
   const { user_name, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const currentUserNameError = getCurrentUserNameError(user_name);
   const currentPasswordError = await getCurrentPasswordError(
      password,
      user_name
   );
   console.log({ currentUserNameError, currentPasswordError }); // this form of console logging makes it clear what it is
   let dbError = ""; // this will store some text describing an error from the database

   // if there are no errors
   if (currentUserNameError === "" && currentPasswordError == "") {
      // return the user to the client
      db.query(selectUserByUserName, user_name)
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
            db.query(setUserLastLoginAt, [currentDateTime, users[0].id])
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
      res.status(400).json({ currentUserNameError, currentPasswordError });
   }
});

// @route      PUT api/v1/users/delete
// @desc       Delete an existing user
// @access     Private
// test:
router.put("/delete", validateJwt, async (req, res) => {
   const { currentPassword } = req.body; // grabbing variable from req.body
   const userId = req.user.id; // get the user id from the JWT

   const currentPasswordError = await checkPasswordAgainstUserId(
      currentPassword,
      userId
   ); // check to see if the password submitted is correct

   if (currentPasswordError === "") {
      // if it gets this far, user_name can be changed

      db.query(deleteUser, [userId])
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
      console.log({ currentPasswordError });
      res.status(400).json({
         currentPasswordError,
      });
   }
});

// @route      PUT api/v1/users/set-user-name
// @desc       change a user_name
// @access     Private
// test:
router.put("/set-user-name", validateJwt, async (req, res) => {
   // console.log("req.body", req.body);

   const { newUserName, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const new_username_error = await getNewUserNameError(newUserName); // check to see if the new user_name is valid
   console.log({ new_username_error });
   const currentPasswordError = await checkPasswordAgainstUserId(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      new_username_error,
      currentPasswordError,
   });

   if (new_username_error === "" && currentPasswordError === "") {
      // if it gets this far, user_name can be changed
      console.log("user_name can be changed");
      // res.status(200).json("UserName can be changed");

      db.query(setUserUserName, [newUserName, userId])
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
         new_username_error,
         currentPasswordError,
      });
   }
});

// @route      PUT api/v1/users/set-email
// @desc       change an email
// @access     Private
// test:
router.put("/set-email", validateJwt, async (req, res) => {
   const { new_email, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const new_email_error = await get_new_email_error(new_email); // check to see if the new email is valid
   console.log({ new_email_error });
   const current_password_error = await checkPasswordAgainstUserId(
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
router.put("/set-team-name", validateJwt, async (req, res) => {
   const { newTeamName, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   const newTeamNameError = await getNewTeamNameError(newTeamName); // check to see if the new team name is valid
   const currentPasswordError = await checkPasswordAgainstUserId(
      password,
      userId
   ); // check to see if the password submitted is correct

   if (newTeamNameError === "" && currentPasswordError === "") {
      // if it gets this far, team name can be changed

      db.query(setUserTeamName, [newTeamName, userId])
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
         newTeamNameError,
         currentPasswordError,
      });
   }
});

// @route      PUT api/v1/users/set-initials
// @desc       change a user's initials
// @access     Private
// test:
router.put("/set-initials", validateJwt, async (req, res) => {
   const { newInitials, password } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   console.log({ userId });
   const newInitialsError = await getNewInitialsError(newInitials); // check to see if the new initials is valid
   console.log({ newInitialsError });
   const currentPasswordError = await checkPasswordAgainstUserId(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      newInitialsError,
      currentPasswordError,
   });

   if (newInitialsError === "" && currentPasswordError === "") {
      // if it gets this far, initials can be changed
      console.log("initials can be changed");

      db.query(setUserInitials, [newInitials, userId])
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
         newInitialsError,
         currentPasswordError,
      });
   }
});

// @route      PUT api/v1/users/set-password
// @desc       change a password
// @access     Private
// test:
router.put("/set-password", validateJwt, async (req, res) => {
   const { currentPassword, newPassword } = req.body; // grabbing variables from req.body
   const userId = req.user.id; // get the user id from the JWT
   const currentPasswordError = await checkPasswordAgainstUserId(
      currentPassword,
      userId
   ); // check to see if the currentPassword submitted is correct
   const newPasswordError = await getNewPasswordError(newPassword); // check to see if the newPassword submitted is gtg
   let messageFromServer = "";
   let resStatus = 200;

   // if there are no errors, change the password
   if (currentPasswordError === "" && newPasswordError === "") {
      // if it gets this far, password can be changed

      db.query(setUserPassword, [await toHash(newPassword), userId])
         .then((dbRes) => {
            resStatus = 200;
            messageFromServer = "Your password was changed.";
            sendResponse();
         })
         .catch((err) => {
            resStatus = 400;
            messageFromServer = "There was an error on the server.";
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
         currentPasswordError,
         newPasswordError,
         messageFromServer,
      });
      res.status(resStatus).json({
         currentPasswordError,
         newPasswordError,
         messageFromServer,
      });
   }
});
module.exports = router;
