module.exports = function get_current_user_name_error(user_name) {
   if (user_name === "") {
      return "Please enter your user name.";
   }
   return "";
   // we are only concerned that they enter something, we won't tell them if the user name exists or not
};
