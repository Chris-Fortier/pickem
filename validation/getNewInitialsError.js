module.exports = async function get_new_initials_error(initials) {
   if (initials === "") {
      return "Please enter your initials.";
   }
   return "";
};
