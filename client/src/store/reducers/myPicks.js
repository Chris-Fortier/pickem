import actions from "../actions";

export default function my_picks(my_picks = [], action) {
   let newMyPicks = [...my_picks];

   switch (action.type) {
      case actions.STORE_MY_PICKS:
         console.log("FIRED STORE_MY_PICKS");
         newMyPicks = action.payload;
         return newMyPicks;
      default:
         return my_picks;
   }
}
