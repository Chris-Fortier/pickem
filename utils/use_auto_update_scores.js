import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { SUCCESS_MESSAGE_DURATION } from "./client_helpers";

// checks for new scores on ESPN when the user logs in and each time they go to a page
// the server decides if a check is due, which is only when games are missing scores and there hasn't been a check in the last 10 minutes
// returns the time scores were last filled in (so pages can reload) and a message to show while checking
export default function use_auto_update_scores(user) {
   const router = useRouter();
   const [scores_updated_at, set_scores_updated_at] = useState(0);
   const [score_check_message, set_score_check_message] = useState({});
   const is_checking = useRef(false);

   useEffect(() => {
      if (!user?.id) {
         return;
      }

      const check_scores = () => {
         if (is_checking.current) {
            return;
         }
         is_checking.current = true;
         axios
            .get("/api/games/auto-update-scores")
            .then((res) => {
               if (!res.data.is_due) {
                  return;
               }
               set_score_check_message({
                  message: "Checking for new scores...",
                  variant: "warning",
               });
               return axios
                  .post("/api/games/auto-update-scores")
                  .then((res) => {
                     const { num_filled } = res.data;
                     if (!num_filled) {
                        set_score_check_message({});
                        return;
                     }
                     set_scores_updated_at(Date.now());
                     set_score_check_message({
                        message: `Updated ${num_filled} ${
                           num_filled === 1 ? "score" : "scores"
                        }.`,
                        variant: "success",
                     });
                     setTimeout(
                        () => set_score_check_message({}),
                        SUCCESS_MESSAGE_DURATION
                     );
                  });
            })
            .catch((err) => {
               // the page still works without the new scores, so just log it
               console.log("Could not check for new scores.", err);
               set_score_check_message({});
            })
            .finally(() => {
               is_checking.current = false;
            });
      };

      check_scores();
      router.events.on("routeChangeComplete", check_scores);
      return () => {
         router.events.off("routeChangeComplete", check_scores);
      };
   }, [user?.id, router]);

   return { scores_updated_at, score_check_message };
}

// calls on_scores_updated when new scores are filled in while the page is open
// not when the page first loads, since the page gets the latest scores then anyway
export function use_on_scores_updated(scores_updated_at, on_scores_updated) {
   const first_scores_updated_at = useRef(scores_updated_at);

   useEffect(() => {
      if (scores_updated_at !== first_scores_updated_at.current) {
         on_scores_updated();
      }
   }, [scores_updated_at]);
}
