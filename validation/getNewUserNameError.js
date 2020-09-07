const { checkIfUserNameExists } = require("../utils/helpers");

module.exports = async function getNewUserNameError(user_name) {
   if (user_name === "") {
      return "Please enter a new user name.";
   }
   if (await checkIfUserNameExists(user_name)) {
      return "This user name already exists.";
   }
   return "";
};
