const { PHONE_REGEX } = require("../utils/helpers");
const db = require("../db");

module.exports = function getSignUpPhoneError(phone) {
   if (phone === "") {
      return "Please enter your contact phone number.";
   }
   if (!PHONE_REGEX.test(phone)) {
      return "Please enter valid 10-digit phone number.";
   }
   return "";
};
