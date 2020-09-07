module.exports = function getCurrentUserNameError(user_name) {
   console.log("getCurrentUserNameError()...");
   if (user_name === "") {
      return "Please enter your user name.";
   }
   return "";
};
