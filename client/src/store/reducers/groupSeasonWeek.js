import actions from "../actions";

export default function groupSeasonWeek(groupSeasonWeek = {}, action) {
   switch (action.type) {
      case actions.SET_GROUP_SEASON_WEEK:
         return { ...action.payload };
      case actions.SET_WEEK:
         return {
            group_id: groupSeasonWeek.group_id,
            season: groupSeasonWeek.season,
            week: action.payload,
         };
      default:
         return groupSeasonWeek;
   }
}
