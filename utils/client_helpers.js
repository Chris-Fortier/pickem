// client-side constants
// const SALT_ROUNDS = 12;
export const MAX_USER_NAME_LENGTH = 24;
export const MAX_EMAIL_LENGTH = 100;
export const MAX_TEAM_NAME_LENGTH = 24;
export const MAX_USER_INITIALS_LENGTH = 3;
// export const TIME_UNTIL_WARNING_SHOWN = 2000; // ms until the warning message pops up
// export const TIME_UNTIL_SUCCESS_HIDDEN = 2000; // ms until a success message disappears

// // returns a hashed version of a given password
// export function toHash(myPlaintextPassword) {
//    return bcrypt.hash(myPlaintextPassword, SALT_ROUNDS);
// }

export function get_num_regular_season_weeks(season) {
   if (season <= 2020) {
      return 17;
   }
   return 18;
}

// input a week number or '%' and return 'Week X' or 'Entire Season'
export function get_week_or_season_text(week, season, is_abbr = false) {
   const num_regular_season_weeks = get_num_regular_season_weeks(season);

   if (!is_abbr) {
      if (week === "%") {
         return "Entire Season";
      } else if (week === num_regular_season_weeks + 1) {
         return "Wildcard Round";
      } else if (week === num_regular_season_weeks + 2) {
         return "Divisional Round";
      } else if (week === num_regular_season_weeks + 3) {
         return "Conference Championships";
      } else if (week === num_regular_season_weeks + 4) {
         return "The Big Game";
      }
      return `Week ${week}`;
   } else {
      if (week === "%") {
         return "Entire Season";
      } else if (week === num_regular_season_weeks + 1) {
         return "WR";
      } else if (week === num_regular_season_weeks + 2) {
         return "DR";
      } else if (week === num_regular_season_weeks + 3) {
         return "CC";
      } else if (week === num_regular_season_weeks + 4) {
         return "SB";
      }
      return String(week);
   }
}

export const NUM_WEEKS_IN_SEASON = 22; // includes playoffs and superbowl, not preseason
const WED_BEFORE_GAME_1 = 1662534000000; // time of the Wednesday before first game this season
export const SEASONS = [2020, 2021, 2022];

// sets the users position when they refresh the page
export const DEFAULT_GROUP_SEASON_WEEK = {
   group_id: "3fd8d78c-8151-4145-b276-aea3559deb76",
   season: SEASONS[SEASONS.length - 1],
   week: Math.max(
      Math.min(
         Math.floor((Date.now() - WED_BEFORE_GAME_1) / 604800000 + 1),
         NUM_WEEKS_IN_SEASON // makes it show the superbowl week if current date is later
      ),
      1 // makes it show week 1 if current date is earlier
   ), // set the week to how many Wednesdays have started since the start of season
};

export const WEEKS = [
   "%",
   ...Array.from({ length: NUM_WEEKS_IN_SEASON }, (_, index) => index + 1),
]; // the WEEKS the user can select from

export const SUCCESS_MESSAGE_DURATION = 3000;
