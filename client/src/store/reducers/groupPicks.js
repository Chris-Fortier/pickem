import actions from "../actions";

export default function group_picks(group_picks = {}, action) {
   switch (action.type) {
      case actions.STORE_GROUP_PICKS:
         return { ...action.payload };
      default:
         return group_picks;
   }
}
