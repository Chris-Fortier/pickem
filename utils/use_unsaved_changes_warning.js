import { useEffect } from "react";
import { useRouter } from "next/router";
import {
   UNSAVED_CHANGES_MESSAGE,
   set_has_unsaved_changes,
   get_has_unsaved_changes,
} from "./unsaved_changes";

// warns the user if they try to leave the page while has_changes is true
// (the nav bar also checks this before changing the season/week or logging out)
export default function use_unsaved_changes_warning(has_changes) {
   const router = useRouter();

   // let the rest of the app know if there are unsaved changes
   useEffect(() => {
      set_has_unsaved_changes(has_changes);
   }, [has_changes]);
   useEffect(() => {
      return () => set_has_unsaved_changes(false); // leaving the page
   }, []);

   useEffect(() => {
      // refreshing, closing the tab or going to another site
      const handle_before_unload = (e) => {
         if (get_has_unsaved_changes()) {
            e.preventDefault();
            e.returnValue = ""; // needed for some browsers to show the warning
         }
      };
      // going to another page in the app
      const handle_route_change_start = () => {
         if (
            get_has_unsaved_changes() &&
            !window.confirm(UNSAVED_CHANGES_MESSAGE)
         ) {
            router.events.emit("routeChangeError");
            throw "Route change cancelled because of unsaved changes.";
         }
      };
      window.addEventListener("beforeunload", handle_before_unload);
      router.events.on("routeChangeStart", handle_route_change_start);
      return () => {
         window.removeEventListener("beforeunload", handle_before_unload);
         router.events.off("routeChangeStart", handle_route_change_start);
      };
   }, [router]);
}
