require("dotenv").config();
const jwt = require("jsonwebtoken");

// this is a "middleware" function
module.exports = function validateJwt(req, res, next) {
   const accessToken = req.header("x-auth-token");

   if (!accessToken) {
      return res.status(401).json({ authError: "No token provided." });
   }

   try {
      // verify the token,
      // if valid, extract the user payload
      const decodedPayload = jwt.verify(
         accessToken,
         process.env.JWT_ACCESS_SECRET
      );

      // assign the payload to the request
      req.user = decodedPayload;

      // continue on in the API
      next();
   } catch {
      return res.status(401).json({ authError: "Unauthorized token." });
   }
};
