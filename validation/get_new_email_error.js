const { EMAIL_REGEX } = require("../utils/helpers");

module.exports = async function get_new_email_error(email) {
   if (email === "") {
      return "Please enter a new email.";
   }
   if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address.";
   }
   return "";
};
