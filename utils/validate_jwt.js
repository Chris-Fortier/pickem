require("dotenv").config();
const jwt = require("jsonwebtoken");

// this is a "middleware" function
module.exports = function validate_jwt(req, res, next) {
   const access_token = req.headers["x-auth-token"];

   if (!access_token) {
      console.log("No token provided.");
      return res.status(401).json({ authError: "No token provided." });
   }

   try {
      // verify the token,
      // if valid, extract the user payload
      const decoded_payload = jwt.verify(
         access_token,
         process.env.JWT_ACCESS_SECRET
      );

      // assign the payload to the request
      req.user = decoded_payload;

      // continue on in the API
      next();
   } catch {
      return res.status(401).json({ authError: "Unauthorized token." });
   }
};
