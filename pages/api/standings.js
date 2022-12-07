const knex = require("knex");
const config = require("../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();

export default async (req, res) => {
   // To test in Postman:
   // Set the dropdown to GET
   // http://localhost:3000/api/standings
   // put a name and password in Body tab under x-www-form-urlencoded
   if (req.method === "GET") {
      const { group_id, season, week } = req.query; // grabbing variables from req.query

      // determine if we only want data for a specific week or the entire season
      const where_args = { group_id, season };
      if (week !== "all") {
         where_args.week = week;
      }

      console.log("req.query", req.query);

      mysqldb
         .select(
            "user_id",
            "team_name",
            "initials",
            mysqldb.raw(
               "SUM(CASE WHEN `pick` = (CASE WHEN `away_score` > `home_score` THEN 0 WHEN `away_score` < `home_score` THEN 1 WHEN `away_score` = `home_score` THEN 2 ELSE NULL END) AND `pick` is not null THEN 1 ELSE 0 END) AS `num_correct`"
            ),
            mysqldb.raw(
               "SUM(CASE WHEN `pick` = (CASE WHEN `away_score` > `home_score` THEN 0 WHEN `away_score` < `home_score` THEN 1 WHEN `away_score` = `home_score` THEN 2 ELSE NULL END) AND `pick` is not null THEN `value` ELSE 0 END) AS `num_points`"
            ),
            mysqldb.raw("COUNT(`pick`) AS `num_picks`"),
            mysqldb.raw("COUNT(`away_score`) AS `num_finished_games`")
         )
         .from("games")
         .rightJoin("picks", "picks.game_id", "games.id")
         .rightJoin("users", "picks.user_id", "users.id")
         .where(where_args)
         .groupBy("user_id")
         .orderBy("num_points", "desc")
         .then((standings) => {
            if (standings.length && standings[0].num_finished_games) {
               // process the standings
               let current_rank = 1;
               let prev_points = standings[0].num_points;
               let max_picks = standings[0].num_picks;
               standings.forEach((standings_item, i) => {
                  standings_item.is_new_rank = i > 0 ? false : true;
                  if (
                     prev_points !== null &&
                     standings_item.num_points < prev_points
                  ) {
                     prev_points = standings_item.num_points;
                     current_rank = i + 1;
                     standings_item.is_new_rank = true;
                  }
                  standings_item.rank = current_rank;
                  standings_item.num_behind =
                     standings_item.num_correct - standings[0].num_correct;
                  standings_item.num_points_behind =
                     standings_item.num_points - standings[0].num_points;
                  if (standings_item.num_picks > max_picks) {
                     max_picks = standings_item.num_picks;
                  }
               });
               // only count users who picked in at least 50% of the games in the standings
               const filtered_standings = standings.filter((standing_item) => {
                  return standing_item.num_picks >= max_picks * 0.5;
               });
               return res.status(200).json(filtered_standings);
            } else {
               // no standings for this week yet, either nobody made any picks or no games have finished
               return res.status(200).json([]);
            }
         })
         .catch((err) => {
            // report error
            console.log(err);
            return res.status(400).json(err);
         });
   }
};
