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
const setUserPassword = require("../../queries/setUserPassword");
const { toHash, TOKEN_EXPIRE_TIME } = require("../../utils/helpers");
const getSignUpUserNameError = require("../../validation/getSignUpUserNameError");
const getSignUpPasswordError = require("../../validation/getSignUpPasswordError");
const getLoginUserNameError = require("../../validation/getLoginUserNameError");
const getLoginPasswordError = require("../../validation/getLoginPasswordError");
const jwt = require("jsonwebtoken");
const validateJwt = require("../../utils/validateJwt");
const setUserLastLoginAt = require("../../queries/setUserLastLoginAt");
const checkPasswordAgainstUserId = require("../../validation/checkPasswordAgainstUserId");
const uuid = require("uuid");

// @route      POST api/v1/users (going to post one thing to this list of things)
// @desc       Create a new user
// @access     Public
router.post("/", async (req, res) => {
   const { user_name, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const newUserNameError = await getSignUpUserNameError(user_name);
   const newPasswordError = getSignUpPasswordError(password);
   let dbError = ""; // this will store some text describing an error from the database

   console.log({ newUserNameError, newPasswordError });

   // if there are no errors with user_name and password:
   if (newUserNameError === "" && newPasswordError === "") {
      newUserId = uuid.v4(); // generate a uuid
      currentDateTime = Date.now();
      const user = {
         id: newUserId,
         user_name, // if the key and value are called the same, you can just have the key
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

                  // enter new last login
                  // db.query(setUserLastLoginAt, [this_login_at, users[0].id])
                  //    .then(() => {
                  //       res.status(200).json({ accessToken }); // instead of passing the user as the response, pass the access token
                  //    })
                  //    .catch((err) => {
                  //       res.status(400).json("error updating last login time");
                  //    });
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
         newUserNameError,
         newPasswordError,
      });
   }
});

// @route      POST api/v1/users/auth
// @desc       Check this user against the db via user_name and password
// @access     Public
router.post("/auth", async (req, res) => {
   const { user_name, password } = req.body; // destructuring to simplify code below, grabbing variables from req.body
   const currentUserNameError = getLoginUserNameError(user_name);
   const currentPasswordError = await getLoginPasswordError(
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
               created_at: users[0].created_at,
               last_login_at: users[0].last_login_at,
               this_login_at: currentDateTime,
            };

            // this contains the user, a secret and the timeframe
            // 1m for testing, could be longer like 3h, 7d etc
            const accessToken = jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
               expiresIn: TOKEN_EXPIRE_TIME,
            });

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
   console.log("req.body", req.body);
   const { password } = req.body; // grabbing variable from req.body
   const userId = req.user.id; // get the user id from the JWT

   const deleteAccountPasswordError = await checkPasswordAgainstUserId(
      password,
      userId
   ); // check to see if the password submitted is correct

   if (deleteAccountPasswordError === "") {
      // if it gets this far, user_name can be changed

      // TODO: can probably do the first part by doing something with foreign keys and cascading

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
      console.log({ deleteAccountPasswordError });
      res.status(400).json({
         deleteAccountPasswordError,
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
   const newUserNameError = await getSignUpUserNameError(newUserName); // check to see if the new user_name is valid
   console.log({ newUserNameError });
   const currentPasswordError = await checkPasswordAgainstUserId(
      password,
      userId
   ); // check to see if the password submitted is correct
   console.log({
      userId,
      newUserNameError,
      currentPasswordError,
   });

   if (newUserNameError === "" && currentPasswordError === "") {
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
         newUserNameError,
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
   const newPasswordError = await getSignUpPasswordError(newPassword); // check to see if the newPassword submitted is gtg
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
