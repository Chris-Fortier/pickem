// The games resource
const express = require("express");
const router = express.Router();
const knex = require("knex");
const config = require("../../knexfile");
const mysqldb = knex(config);
const validate_jwt = require("../../utils/validate_jwt");

// @route      GET api/v1/games (http://localhost:3060/api/v1/games)
// @desc       this gets the games for a given season and week
// @access     Private
// test: http://localhost:3060/api/v1/games
router.get("/", validate_jwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { season, week } = req.query; // grabbing variables from req.query

   console.log(`finding games in season ${season} and week ${week}`);

   mysqldb
      .select()
      .from("games")
      .where({ season, week })
      .then((games) => {
         return res.status(200).json(games);
      })
      .catch((err) => {
         // report error
         console.log(err);
         return res.status(400).json(err);
      });
});

router.patch("/update-score", validate_jwt, (req, res) => {
   const user_id = req.user.id; // get the user id from the JWT
   const { game_id, away_score, home_score } = req.query; // grabbing variables from req.query

   // TODO: only allow an admin account to do this

   mysqldb("games")
      .where("id", game_id)
      .update({
         // this is so if you send empty values, it will put nulls into the db
         away_score: away_score === "" ? null : away_score,
         home_score: home_score === "" ? null : home_score,
      })
      .then(() => {
         // return a success message
         return res.status(200).json("game updated");
      })
      .catch((err) => {
         // return the error
         return res.status(400).json("error");
      });
});

module.exports = router;
