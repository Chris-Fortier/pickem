module.exports = function getLoginUserNameError(user_name) {
   console.log("getLoginUserNameError()...");
   if (user_name === "") {
      return "Please enter your user name.";
   }
   return "";
};
