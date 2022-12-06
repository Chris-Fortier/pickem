// checks to see if a new password is valid
module.exports = function get_new_password_error(password) {
   // check if password input is blank
   if (password === "") {
      return "Please create a password.";
   }
   // check if password is less than 9 characters
   if (password.length < 9) {
      return "Your password must be at least 9 characters.";
   }
   // check if the password has less than 3 unique characters
   const uniqChars = [...new Set(password)]; // move this down here so it won't be made unless needed
   if (uniqChars.length < 3) {
      return "Your password must have at least three unique characters.";
   }

   return ""; // if it makes it this far, return no error
};
