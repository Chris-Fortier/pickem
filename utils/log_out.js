import axios from "axios";

export default function log_out({ set_user, router }) {
   // stuff that happens when the user logs out
   console.log("Logging out...");

   // delete the header
   delete axios.defaults.headers.common["x-auth-token"];

   // remove the access token
   localStorage.removeItem("access_token");

   // send to the log in page
   if (
      window.location.pathname !== "/log-in" &&
      window.location.pathname !== "/sign-up"
   ) {
      router.push("/log-in", undefined, { shallow: true }); // so if the user goes to website without a valid token, they will go here
   }

   // clear the client user
   set_user({});
}
