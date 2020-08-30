module.exports = async function getSignUpInitialsError(initials) {
   if (initials === "") {
      return "Please enter your initials.";
   }
   return "";
};
