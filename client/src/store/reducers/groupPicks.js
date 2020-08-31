import actions from "../actions";

export default function groupPicks(groupPicks = {}, action) {
   switch (action.type) {
      case actions.STORE_GROUP_PICKS:
         return { ...action.payload };
      default:
         return groupPicks;
   }
}
