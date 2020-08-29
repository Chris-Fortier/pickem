const { EMAIL_REGEX } = require("../utils/helpers");
const db = require("../db");
// const selectUserByEmail = require("../queries/selectUserByEmail");

module.exports = function getSignUpEmailError(email) {
   if (email === "") {
      return "Please enter an email address.";
   }
   if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address.";
   }
   // console.log("checkIsInDb(email)", checkIsInDb(email));
   // if (await checkIsInDb(email)) {
   //    return "This email address already exists in the database.";
   // }
   return "";
};

// function checkIsInDb(email) {
//    console.log("checkIsInDb()...");
//    return db
//       .query(selectUserByEmail, email)
//       .then((users) => {
//          if (users.length === 0) {
//             return false;
//          } else {
//             console.log("email already in the db");
//             return true;
//          }
//       })
//       .catch((err) => {
//          console.log("err", err);
//       });
// }
