const { EMAIL_REGEX } = require("../utils/helpers");

module.exports = async function get_new_email_error(email) {
   // if the email is blank, return no error as we allow no email
   if (email === "" || !email) {
      return "";
   }
   // if they entered something, make sure it is a valid email address
   if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address or leave blank.";
   }
   return "";
};
