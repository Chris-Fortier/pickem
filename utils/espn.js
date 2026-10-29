// server side helpers for getting games from ESPN's public (but unofficial and undocumented) scoreboard feed
import TEAM_NAMES from "./TEAM_NAMES";
import { get_num_regular_season_weeks } from "./client_helpers";

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
   const get_competitor = (home_away) =>
      competition.competitors.find(
         (competitor) => competitor.homeAway === home_away
      );
   const get_team = (competitor) => {
      const espn_abbr = competitor?.team?.abbreviation;
      const abbr = ESPN_TEAM_ABBRS[espn_abbr] || espn_abbr;
      return TEAM_NAMES[abbr] ? abbr : null;
   };
   const away = get_competitor("away");
   const home = get_competitor("home");
   return {
      name: event.name,
      away_team: get_team(away),
      home_team: get_team(home),
      game_at: Date.parse(event.date),
      is_time_confirmed: competition.timeValid !== false,
      is_final: competition.status?.type?.completed === true,
      away_score: parseInt(away?.score),
      home_score: parseInt(home?.score),
   };
};

// get the games for one of our weeks from ESPN, in our format
export const get_espn_games = async (season, week) =>
   (await get_espn_events(season, week)).map(convert_espn_event);

// find our game for an ESPN game, and our game with the home and away teams the other way around if there is one
export const match_espn_game = (espn_game, our_games) => ({
   game: our_games.find(
      (our_game) =>
         our_game.away_team === espn_game.away_team &&
         our_game.home_team === espn_game.home_team
   ),
   swapped_game: our_games.find(
      (our_game) =>
         our_game.away_team === espn_game.home_team &&
         our_game.home_team === espn_game.away_team
   ),
});
