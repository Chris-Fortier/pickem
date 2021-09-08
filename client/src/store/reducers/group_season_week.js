import actions from "../actions";

export default function group_season_week(group_season_week = {}, action) {
   switch (action.type) {
      case actions.SET_GROUP_SEASON_WEEK:
         return { ...action.payload };
      case actions.SET_WEEK:
         return {
            group_id: group_season_week.group_id,
            season: group_season_week.season,
            week: action.payload,
         };
      default:
         return group_season_week;
   }
}
