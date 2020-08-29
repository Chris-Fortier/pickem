const { checkIfUserNameExists } = require("../utils/helpers");

module.exports = async function getSignUpUserNameError(user_name) {
   if (user_name === "") {
      return "Please enter a user_name.";
   }
   if (await checkIfUserNameExists(user_name)) {
      return "This user_name already exists.";
   }
   return "";
};
