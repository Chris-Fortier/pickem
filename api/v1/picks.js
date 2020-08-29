// The sponsorships resource
const express = require("express");
const router = express.Router();
const db = require("../../db");
const selectMyPicksForTheWeek = require("../../queries/selectMyPicksForTheWeek");
const validateJwt = require("../../utils/validateJWT");

// @route      GET api/v1/picks (http://localhost:3060/api/v1/picks)
// @desc       Get all sponsorship opportunities
// @access     Public
// test: http://localhost:3060/api/v1/picks
router.get("/", validateJwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { group_id, season, week } = req.query; // grabbing variables from req.query

   console.log(req.query);

   console.log({ user_id, group_id, season, week });

   db.query(selectMyPicksForTheWeek, [user_id, group_id, season, week]) // this syntax style prevents hackers
      .then((sponsorshipOpportunities) => {
         // successful response

         // console.log(sponsorshipOpportunities);

         return res.status(200).json(sponsorshipOpportunities);
      })
      .catch((err) => {
         // report error
         console.log(err);
         return res.status(400).json(err);
      });
});

module.exports = router;
