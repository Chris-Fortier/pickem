import axios from "axios";
import log_out from "./log_out";

// what happens when a user logs in
export default function log_in({ access_token, router, set_user }) {
   console.log("Logging in...");

   // set token in localStorage
   localStorage.setItem("access_token", access_token);

   // set authorization headers for every request at the moment of log in
   axios.defaults.headers.common["x-auth-token"] = access_token;

   axios
      .get("/api/users")
      .then((res) => {
         const user = res.data;
         set_user(user); // set the client's user with the data received from the server
         if (
            window.location.pathname === "/" ||
            window.location.pathname === "/log-in" ||
            window.location.pathname === "/sign-up"
         ) {
            // go to desired default logged-in page
            router.push("/my-picks", undefined, { shallow: true });
         }
      })
      .catch((err) => {
         // This will hit if the token is invalid or corrupted.
         console.log("Error trying to get user data from server.", err);
         log_out({ set_user, router });
      });
}
