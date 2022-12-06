const knex = require("knex");
const config = require("../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../utils/validate_jwt");

export default async (req, res) => {
   // To test in Postman:
   // Set the dropdown to GET
   // http://localhost:3000/api/group-week-picks
   // put a name and password in Body tab under x-www-form-urlencoded
   validate_jwt(req, res, async () => {
      if (req.method === "GET") {
         const user_id = req.user.id; // get the user id from the JWT
         const {
            // group_id,
            season,
            week,
         } = req.query; // grabbing variables from req.query

         // determine if we only want data for a specific week or the entire season
         const where_args = { season };
         if (week !== "%") {
            where_args.week = week;
         }

         mysqldb
            .select(
               "game_at",
               "away_team",
               "home_team",
               "games.id as game_id",
               "pick",
               "away_score",
               "home_score",
               "picks.user_id",
               "users.initials as user_initials"
            )
            .from("games")
            .leftJoin("picks", "games.id", "picks.game_id")
            .leftJoin("users", "picks.user_id", "users.id")
            .where(where_args)
            .orderBy("game_at", "asc")
            .then((picks) => {
               // successful response

               // find participating users
               const participating_users = [
                  {
                     user_id: user_id,
                     initials: "YOU", // TODO need to get user's initials
                     // num_picks: 0,
                  },
               ]; // initialize with the user first
               const participating_user_ids = [user_id];
               picks.forEach((pick) => {
                  if (
                     pick.user_id &&
                     !participating_user_ids.includes(pick.user_id)
                  ) {
                     participating_users.push({
                        user_id: pick.user_id,
                        initials: pick.user_initials,
                        // num_picks: 0,
                     });
                     participating_user_ids.push(pick.user_id);
                  }
               });

               // console.log({ participating_users });

               // get list of unique match_ups this week
               const unique_match_ups = [];
               const unique_match_up_ids = [];
               picks.forEach((pick_item) => {
                  if (
                     pick_item.game_id &&
                     !unique_match_up_ids.includes(pick_item.game_id)
                  ) {
                     let winner = null;
                     if (pick_item.away_score > pick_item.home_score) {
                        winner = 0;
                     } else if (pick_item.away_score < pick_item.home_score) {
                        winner = 1;
                     }
                     unique_match_ups.push({
                        title: `${pick_item.away_team} @ ${pick_item.home_team}`,
                        game_id: pick_item.game_id,
                        game_at: pick_item.game_at,
                        winner: winner,
                        away_team: pick_item.away_team,
                        home_team: pick_item.home_team,
                     });

                     unique_match_up_ids.push(pick_item.game_id);
                  }
               });

               // add all user picks to each matchup
               // add is_new_date values too
               let current_date_at = null;
               unique_match_ups.forEach((match_up) => {
                  if (
                     match_up.game_at - current_date_at > 12 * 3600000 ||
                     current_date_at === null
                  ) {
                     match_up.is_new_date = true;
                     current_date_at = match_up.game_at;
                  } else {
                     match_up.is_new_date = false;
                  }
                  const match_up_picks = {};
                  participating_users.forEach((user) => {
                     const user_pick = picks.find((pick2) => {
                        return (
                           pick2.user_id === user.user_id &&
                           pick2.game_id === match_up.game_id
                        );
                     });
                     let pick_label = "-";
                     let pick_result = null;
                     if (user_pick) {
                        if (user_pick.pick === 0)
                           pick_label = match_up.away_team;
                        if (user_pick.pick === 1)
                           pick_label = match_up.home_team;
                        if (
                           user.user_id !== user_id &&
                           pick_label !== "-" &&
                           match_up.game_at > Date.now()
                        ) {
                           pick_label = "X"; // conceal other players' picks until game time
                        }
                        if (match_up.winner !== null) {
                           pick_result = user_pick.pick === match_up.winner;
                        }
                     }
                     match_up_picks[user.user_id] = {
                        pick: null,
                        pick_label: pick_label,
                        pick_result: pick_result,
                     };
                  });
                  match_up["picks"] = match_up_picks;
               });

               // console.log({ unique_match_ups });

               return res.status(200).json({
                  teams: participating_users,
                  match_ups: unique_match_ups,
               });
            })
            .catch((err) => {
               // report error
               console.log(err);
               return res.status(400).json(err);
            });
      }
   });
};
