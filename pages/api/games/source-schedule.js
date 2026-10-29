const knex = require("knex");
const config = require("../../../knexfile");
const mysqldb = knex(config);
require("dotenv").config();
const validate_jwt = require("../../../utils/validate_jwt");
import TEAM_NAMES from "../../../utils/TEAM_NAMES";
import {
   get_num_regular_season_weeks,
   get_game_value,
} from "../../../utils/client_helpers";

// ESPN's public (but unofficial and undocumented) scoreboard feed
const ESPN_SCOREBOARD_URL =
   "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

// ESPN team abbreviations that are different from ours
const ESPN_TEAM_ABBRS = {
   WSH: "WAS",
};

// get the ESPN season type and week(s) to look up for one of our weeks
// our weeks after the regular season are the playoffs: wild-card, divisional, conference and the big game
const get_espn_weeks = (season, week) => {
   const num_regular_season_weeks = get_num_regular_season_weeks(season);
   if (week <= num_regular_season_weeks) {
      return { season_type: 2, espn_weeks: [week] };
   }
   const postseason_week = week - num_regular_season_weeks;
   if (postseason_week === 4) {
      // the big game has been ESPN postseason week 5 when there was a Pro Bowl week before it, so check both
      return { season_type: 3, espn_weeks: [4, 5] };
   }
   return { season_type: 3, espn_weeks: [postseason_week] };
};

const get_espn_events = async (season, week) => {
   const { season_type, espn_weeks } = get_espn_weeks(season, week);
   const events = [];
   for (const espn_week of espn_weeks) {
      const response = await fetch(
         `${ESPN_SCOREBOARD_URL}?dates=${season}&seasontype=${season_type}&week=${espn_week}`,
         { signal: AbortSignal.timeout(10000) }
      );
      if (!response.ok) {
         throw new Error(`ESPN responded with ${response.status}.`);
      }
      const data = await response.json();
      events.push(...(data.events || []));
   }
   return events;
};

// convert an ESPN event to a game in our format
// team abbreviations are null if they are not a known team (TBD, Pro Bowl teams, etc.)
const convert_espn_event = (event) => {
   const competition = event.competitions[0];
   const get_team = (home_away) => {
      const competitor = competition.competitors.find(
         (competitor) => competitor.homeAway === home_away
      );
      const espn_abbr = competitor?.team?.abbreviation;
      const abbr = ESPN_TEAM_ABBRS[espn_abbr] || espn_abbr;
      return TEAM_NAMES[abbr] ? abbr : null;
   };
   return {
      name: event.name,
      away_team: get_team("away"),
      home_team: get_team("home"),
      game_at: Date.parse(event.date),
      is_time_confirmed: competition.timeValid !== false,
   };
};

export default async (req, res) => {
   validate_jwt(req, res, async () => {
      // used to compare our schedule for a week with ESPN's, to find games to add and games whose time changed
      // nothing is changed here, it just returns what would change
      // To test in Postman:
      // Set the dropdown to GET
      // http://localhost:3000/api/games/source-schedule?season=2026&week=9
      // in the Headers tab, add an `x-auth-token` key and paste the key from your browser (In the inspector > Application tab > Local Storage > access_token)
      if (req.method === "GET") {
         const user_id = req.user.id; // get the user id from the JWT
         const season = parseInt(req.query.season);
         const week = parseInt(req.query.week);

         if (isNaN(season) || isNaN(week) || week < 1) {
            return res.status(400).json("A season and week are required.");
         }

         try {
            const users = await mysqldb
               .select("is_admin")
               .from("users")
               .where({ id: user_id });
            if (!users.length || users[0].is_admin !== 1) {
               return res.status(400).json("This user is not an admin.");
            }

            let source_games;
            try {
               source_games = (await get_espn_events(season, week)).map(
                  convert_espn_event
               );
            } catch (err) {
               console.log(err);
               return res
                  .status(502)
                  .json("Could not get the schedule from ESPN.");
            }

            const our_games = await mysqldb
               .select()
               .from("games")
               .where({ season, week })
               .orderBy("game_at", "asc");

            const now = Date.now();
            const result = {
               adds: [], // games ESPN has that we don't
               updates: [], // games we both have but ESPN has a different time
               num_unchanged: 0, // games we both have with the same time
               skipped: [], // ESPN games we can't use yet
               swapped: [], // games we have with the home and away teams the other way around from ESPN
               not_in_source: [], // games we have that ESPN doesn't
            };
            const matched_game_ids = [];

            source_games.forEach((source_game) => {
               if (!source_game.away_team || !source_game.home_team) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Teams not known yet",
                  });
                  return;
               }

               const game = our_games.find(
                  (our_game) =>
                     our_game.away_team === source_game.away_team &&
                     our_game.home_team === source_game.home_team
               );
               const swapped_game = our_games.find(
                  (our_game) =>
                     our_game.away_team === source_game.home_team &&
                     our_game.home_team === source_game.away_team
               );
               if (game) {
                  matched_game_ids.push(game.id);
               }
               if (swapped_game) {
                  matched_game_ids.push(swapped_game.id);
               }

               if (!source_game.is_time_confirmed) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Time not confirmed yet",
                  });
               } else if (swapped_game) {
                  result.swapped.push({
                     game_id: swapped_game.id,
                     away_team: swapped_game.away_team,
                     home_team: swapped_game.home_team,
                     game_at: swapped_game.game_at,
                  });
               } else if (game) {
                  if (game.game_at === source_game.game_at) {
                     result.num_unchanged += 1;
                  } else if (game.game_at <= now) {
                     result.skipped.push({
                        name: source_game.name,
                        reason: "Game already started, time not changed",
                     });
                  } else {
                     result.updates.push({
                        game_id: game.id,
                        away_team: game.away_team,
                        home_team: game.home_team,
                        old_game_at: game.game_at,
                        game_at: source_game.game_at,
                     });
                  }
               } else if (source_game.game_at <= now) {
                  result.skipped.push({
                     name: source_game.name,
                     reason: "Game already started, not added",
                  });
               } else {
                  result.adds.push({
                     season,
                     week,
                     away_team: source_game.away_team,
                     home_team: source_game.home_team,
                     game_at: source_game.game_at,
                     value: get_game_value(week),
                  });
               }
            });

            result.not_in_source = our_games
               .filter((game) => !matched_game_ids.includes(game.id))
               .map((game) => ({
                  game_id: game.id,
                  away_team: game.away_team,
                  home_team: game.home_team,
                  game_at: game.game_at,
               }));

            return res.status(200).json(result);
         } catch (err) {
            // report error
            console.log(err);
            return res.status(400).json(err);
         }
      }
   });
};
