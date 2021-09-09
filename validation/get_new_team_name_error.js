const {
   check_if_existing_user_has_key_with_value,
} = require("../utils/helpers");

module.exports = async function get_new_team_name_error(team_name) {
   if (team_name === "") {
      return "Please enter a new team name.";
   }
   if (await check_if_existing_user_has_key_with_value({ team_name })) {
      return "This team name is already being used by another account.";
   }
   return "";
};
