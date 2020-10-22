import actions from "../actions";

export default function message(message = {}, action) {
   switch (action.type) {
      case actions.STORE_WARNING_MESSAGE:
         return {
            message: action.payload,
            variant: "warning",
            time: Date.now(),
         };
      case actions.STORE_SUCCESS_MESSAGE:
         return {
            message: action.payload,
            variant: "success",
            time: Date.now(),
         };
      case actions.STORE_DANGER_MESSAGE:
         return {
            message: action.payload,
            variant: "danger",
            time: Date.now(),
         };
      case actions.CLEAR_MESSAGE:
         console.log(`Message to display: (CLEARED)`);
         return {};
      default:
         return message;
   }
}
