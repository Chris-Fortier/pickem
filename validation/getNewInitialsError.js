module.exports = async function getNewInitialsError(initials) {
   if (initials === "") {
      return "Please enter your initials.";
   }
   return "";
};
