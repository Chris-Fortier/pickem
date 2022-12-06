const {
   check_if_existing_user_has_key_with_value,
} = require("../utils/helpers");

module.exports = async function get_new_user_name_error(name) {
   if (name === "") {
      return "Please enter a new user name.";
   }
   if (await check_if_existing_user_has_key_with_value({ name })) {
      return "This user name already exists.";
   }
   return "";
};
