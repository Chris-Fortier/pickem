const validate_and_change_user_property = require("../../../utils/validate_and_change_user_property");
const get_new_user_name_error = require("../../../validation/get_new_user_name_error");

export default async (req, res) => {
   // To test in Postman:
   // Set the dropdown to PATCH
   // http://localhost:3000/api/users/change-initials
   // put a new_value and current_password in Body tab under x-www-form-urlencoded
   // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)

   validate_and_change_user_property({
      req,
      res,
      property: "initials",
      validation_function: get_new_user_name_error,
   });
};
