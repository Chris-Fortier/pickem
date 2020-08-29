import actions from "../actions";

export default function myPicks(myPicks = [], action) {
   let newMyPicks = [...myPicks];

   switch (action.type) {
      case actions.STORE_MY_PICKS:
         console.log("FIRED STORE_MY_PICKS");
         newMyPicks = action.payload;
         return newMyPicks;
      default:
         return myPicks;
   }
}
