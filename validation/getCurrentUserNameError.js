module.exports = function get_current_user_name_error(user_name) {
   console.log("get_current_user_name_error()...");
   if (user_name === "") {
      return "Please enter your user name.";
   }
   return "";
};
