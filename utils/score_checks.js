// server side helpers for checking our scores against ESPN's final scores, filling in missing scores and recording each check
import { get_espn_games, match_espn_game } from "./espn";

const SCORE_FIELDS = ["away_score", "home_score"];

const AUTO_CHECK_START = 2.5 * 3600000; // a game could be final on ESPN 2.5 hours after it starts
const AUTO_CHECK_END = 3 * 24 * 3600000; // stop checking a game automatically 3 days after it starts, for postponed games etc.
const AUTO_CHECK_INTERVAL = 10 * 60000; // check automatically at most once every 10 minutes

const is_valid_score = (score) =>
   Number.isInteger(score) && score >= 0 && score <= 100;

// compare our games for a week with ESPN's games, to find scores to fill in
export const compare_scores = (source_games, our_games) => {
   const result = {
      fills: [], // games with no saved score that ESPN has a final score for
      differs: [], // games with a saved score that is different from ESPN's
      num_unchanged: 0, // games with the same saved score as ESPN's
      skipped: [], // ESPN games we can't use yet
      swapped: [], // games we have with the home and away teams the other way around from ESPN
      not_in_ours: [], // ESPN games that are not in our schedule
   };

   source_games.forEach((source_game) => {
      if (!source_game.away_team || !source_game.home_team) {
         result.skipped.push({
            name: source_game.name,
            reason: "Teams not known yet",
         });
         return;
      }
      if (!source_game.is_final) {
         result.skipped.push({
            name: source_game.name,
            reason: "Not final yet",
         });
         return;
      }
      if (
         !is_valid_score(source_game.away_score) ||
         !is_valid_score(source_game.home_score)
      ) {
         result.skipped.push({
            name: source_game.name,
            reason: "ESPN's score is not valid",
         });
         return;
      }

      const { game, swapped_game } = match_espn_game(source_game, our_games);
      const scores = {
         away_score: source_game.away_score,
         home_score: source_game.home_score,
      };

      if (swapped_game) {
         result.swapped.push({
            game_id: swapped_game.id,
            away_team: swapped_game.away_team,
            home_team: swapped_game.home_team,
            game_at: swapped_game.game_at,
         });
      } else if (!game) {
         result.not_in_ours.push({
            away_team: source_game.away_team,
            home_team: source_game.home_team,
            game_at: source_game.game_at,
            ...scores,
         });
      } else if (
         SCORE_FIELDS.some(
            (field) => game[field] !== null && game[field] !== scores[field]
         )
      ) {
         result.differs.push({
            game_id: game.id,
            away_team: game.away_team,
            home_team: game.home_team,
            saved_away_score: game.away_score,
            saved_home_score: game.home_score,
            ...scores,
         });
      } else if (SCORE_FIELDS.some((field) => game[field] === null)) {
         result.fills.push({
            game_id: game.id,
            away_team: game.away_team,
            home_team: game.home_team,
            ...scores,
         });
      } else {
         result.num_unchanged += 1;
      }
   });

   return result;
};

// get ESPN's scores for a week and compare them with ours, nothing is changed
export const get_source_scores = async (mysqldb, season, week) => {
   const source_games = await get_espn_games(season, week);
   const our_games = await mysqldb
      .select()
      .from("games")
      .where({ season, week })
      .orderBy("game_at", "asc");
   return compare_scores(source_games, our_games);
};

// check ESPN's scores for a week, fill in our missing scores and record the check
// check_type is "auto" or "manual"
// returns the filled in scores, or the error if ESPN couldn't be checked
export const check_and_fill_scores = async (
   mysqldb,
   { season, week, check_type, user_id }
) => {
   const score_check = { season, week, check_type, user_id };

   let result;
   try {
      result = await get_source_scores(mysqldb, season, week);
   } catch (err) {
      console.log(err);
      const error = String(err.message || err).slice(0, 255);
      await mysqldb("score_checks").insert({
         ...score_check,
         checked_at: Date.now(),
         error,
      });
      return { filled: [], error };
   }

   const filled = [];
   await mysqldb.transaction(async (trx) => {
      for (const fill of result.fills) {
         // only fill in scores that are still missing, in case someone saved them since they were checked
         const num_updated = await trx("games")
            .where("id", fill.game_id)
            .andWhere((query) =>
               query.whereNull("away_score").orWhereNull("home_score")
            )
            .update({
               away_score: fill.away_score,
               home_score: fill.home_score,
            });
         if (num_updated) {
            filled.push(fill);
         }
      }
      await trx("score_checks").insert({
         ...score_check,
         checked_at: Date.now(),
         num_filled: filled.length,
         details: JSON.stringify({ ...result, fills: filled }),
      });
   });

   return { filled };
};

// the weeks with games that might have a final score on ESPN but don't have one saved yet
export const get_weeks_needing_scores = async (mysqldb) => {
   const now = Date.now();
   return mysqldb
      .distinct("season", "week")
      .from("games")
      .where((query) =>
         query.whereNull("away_score").orWhereNull("home_score")
      )
      .andWhere("game_at", "<=", now - AUTO_CHECK_START)
      .andWhere("game_at", ">", now - AUTO_CHECK_END)
      .orderBy([
         { column: "season", order: "asc" },
         { column: "week", order: "asc" },
      ]);
};

// whether it has been long enough since the last automatic check
export const is_auto_check_allowed = async (mysqldb) => {
   const rows = await mysqldb
      .select("last_auto_check_at")
      .from("score_check_throttle")
      .where({ id: 1 });
   return (
      !rows.length || rows[0].last_auto_check_at <= Date.now() - AUTO_CHECK_INTERVAL
   );
};

// claim the next automatic check so only one user's page load does it
// returns false if another check happened in the last 10 minutes
export const claim_auto_check = async (mysqldb) => {
   const now = Date.now();
   const num_updated = await mysqldb("score_check_throttle")
      .where({ id: 1 })
      .andWhere("last_auto_check_at", "<=", now - AUTO_CHECK_INTERVAL)
      .update({ last_auto_check_at: now });
   return num_updated > 0;
};
