module.exports = function getSignUpPasswordError(password) {
   if (password === "") {
      // check if password input is blank
      return "Please create a password.";
   }
   if (password.length < 9) {
      // check if password is less than 9 characters
      return "Your password must be at least 9 characters.";
   }
   const uniqChars = [...new Set(password)]; // move this down here so it won't be made unless needed
   if (uniqChars.length < 3) {
      // check if the password has less than 3 unique characters
      return "Your password must have at least three unique characters.";
   }

   return "";
};
