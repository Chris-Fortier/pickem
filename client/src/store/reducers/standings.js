import actions from "../actions";

export default function standings(standings = [], action) {
   switch (action.type) {
      case actions.STORE_STANDINGS:
         console.log("FIRED STORE_STANDINGS");
         return [...action.payload];
      default:
         return standings;
   }
}
