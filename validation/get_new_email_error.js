const { EMAIL_REGEX } = require("../utils/helpers");

module.exports = async function get_new_email_error(email) {
   if (email === "") {
      return ""; // no email is allowed
   }
   if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address or leave blank.";
   }
   return "";
};
