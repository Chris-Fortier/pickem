const {
   check_if_existing_user_has_key_with_value,
} = require("../utils/helpers");

module.exports = async function get_new_initials_error(initials) {
   if (initials === "") {
      return "Please enter your initials.";
   }
   if (await check_if_existing_user_has_key_with_value({ initials })) {
      return "These initials are already being used by another account.";
   }
   return "";
};
