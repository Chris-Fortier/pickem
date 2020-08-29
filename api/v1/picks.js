// The sponsorships resource
const express = require("express");
const router = express.Router();
const db = require("../../db");
const validateJwt = require("../../utils/validateJWT");
const selectMyPicksForTheWeek = require("../../queries/selectMyPicksForTheWeek");
const upsertPick = require("../../queries/upsertPick");
const selectGame = require("../../queries/selectGame");

// @route      GET api/v1/picks (http://localhost:3060/api/v1/picks)
// @desc       this gets the picks for a given user, group, season and week
// @access     Private
// test: http://localhost:3060/api/v1/picks
router.get("/", validateJwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { group_id, season, week } = req.query; // grabbing variables from req.query

   db.query(selectMyPicksForTheWeek, [
      group_id,
      user_id,
      group_id,
      season,
      week,
   ]) // this syntax style prevents hackers
      .then((picks) => {
         // successful response
         return res.status(200).json(picks);
      })
      .catch((err) => {
         // report error
         console.log(err);
         return res.status(400).json(err);
      });
});

// @route      PUT api/v1/picks (http://localhost:3060/api/v1/picks)
// @desc       upsert a pick (update or create)
// @access     Private
// test: http://localhost:3060/api/v1/picks
router.put("/", validateJwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { game_id, group_id, pick } = req.query; // grabbing variables from req.query

   console.log(req.query);

   // handle null sent from client which is what happens when the user cancels a pick
   let new_pick = pick;
   if (pick === "null") {
      new_pick = null;
   }

   // make sure that this game hasn't already started
   db.query(selectGame, [game_id])
      .then((gameInfo) => {
         console.log("gameInfo", gameInfo[0].game_at);
         if (gameInfo[0].game_at > Date.now()) {
            db.query(upsertPick, [
               user_id,
               game_id,
               group_id,
               new_pick,
               new_pick,
            ]) // this syntax style prevents hackers
               .then((dbRes) => {
                  // successful response

                  return res.status(200).json(dbRes);
               })
               .catch((err) => {
                  // report error
                  console.log(err);
                  return res.status(400).json(err);
               });
         } else {
            console.log("slkjdslkjdfs");
            return res
               .status(400)
               .json(
                  "You cannot set your pick as this game's scheduled start has already happened."
               );
         }
      })
      .catch((err) => {
         // report error
         console.log(err);
         return res.status(400).json(err);
      });
});

module.exports = router;
