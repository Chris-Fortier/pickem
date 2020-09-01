// The picks resource
const express = require("express");
const router = express.Router();
const db = require("../../db");
const validateJwt = require("../../utils/validateJwt");
const selectMyPicksForTheWeek = require("../../queries/selectMyPicksForTheWeek");
const upsertPick = require("../../queries/upsertPick");
const selectGame = require("../../queries/selectGame");
const selectGroupPicksForWeek = require("../../queries/selectGroupPicksForWeek");
const selectGroupSeasonStandings = require("../../queries/selectGroupSeasonStandings");

// @route      GET api/v1/picks (http://localhost:3060/api/v1/picks)
// @desc       this gets the picks for a given user, group, season and week
// @access     Private
// test: http://localhost:3060/api/v1/picks
router.get("/", validateJwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { group_id, season, week } = req.query; // grabbing variables from req.query

   db.query(selectMyPicksForTheWeek, [group_id, user_id, season, week]) // this syntax style prevents hackers
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

// @route      GET api/v1/picks/group-week
// @desc       this gets the picks of the entire group for a week
// @access     Private
// test:
router.get("/group-week", validateJwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { group_id, season, week } = req.query; // grabbing variables from req.query

   db.query(selectGroupPicksForWeek, [user_id, group_id, season, week]) // this syntax style prevents hackers
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

// @route      GET api/v1/picks/standings
// @desc       this gets the standings for a group season
// @access     Public
// test:
router.get("/standings", (req, res) => {
   // const user_id = req.user.id; // get the user id from the JWT
   const { group_id, season } = req.query; // grabbing variables from req.query
   console.log({ group_id, season });

   db.query(selectGroupSeasonStandings, [group_id, season]) // this syntax style prevents hackers
      .then((standings) => {
         // successful response
         console.log(standings);
         return res.status(200).json(standings);
      })
      .catch((err) => {
         // report error
         console.log(err);
         return res.status(400).json(err);
      });
});

// @route      PUT api/v1/picks
// @desc       upsert a pick (update or create)
// @access     Private
// test:
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
