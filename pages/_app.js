import "../styles/master.scss";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import Alert from "react-bootstrap/Alert";
import NavBar from "../components/NavBar";
import log_in from "../utils/log_in";
import log_out from "../utils/log_out";
import {
   DEFAULT_GROUP_SEASON_WEEK,
   SUCCESS_MESSAGE_DURATION,
} from "../utils/client_helpers";

function MyApp({ Component, pageProps }) {
   const router = useRouter();

   // global state
   const [user, set_user] = useState({});
   const [message, set_message] = useState({});
   const [group_season_week, set_group_season_week] = useState(
      DEFAULT_GROUP_SEASON_WEEK
   );

   // global state functions
   const set_danger_message = (message) => {
      set_message({ message: message, variant: "danger", time: Date.now() });
   };
   const set_warning_message = (message) => {
      set_message({ message: message, variant: "warning", time: Date.now() });
   };
   const set_success_message = (message) => {
      set_message({ message: message, variant: "success", time: Date.now() });
      setTimeout(clear_message, SUCCESS_MESSAGE_DURATION);
   };
   const clear_message = () => {
      set_message({});
   };

   // what happens when the site is loaded or refreshed
   useEffect(() => {
      const access_token = localStorage.getItem("access_token"); // get the auth token from local storage

      if (access_token) {
         console.log("Access token found.");
         log_in({ access_token, router, set_user });
      } else {
         console.log("No access token.");
         log_out({ set_user, router });
      }
   }, []);

   return (
      <>
         <Head>
            <title>Hawk Nation NFL Pick&apos;em</title>
            <link rel="icon" href="/favicon.ico" />
         </Head>
         {!isEmpty(user) && (
            // only show Nav if the user is logged in
            <NavBar
               user={user}
               group_season_week={group_season_week}
               set_group_season_week={set_group_season_week}
               set_user={set_user}
            />
         )}
         <Component
            {...pageProps}
            user={user}
            set_user={set_user}
            group_season_week={group_season_week}
            message={message}
            set_danger_message={set_danger_message}
            set_success_message={set_success_message}
            set_warning_message={set_warning_message}
            clear_message={clear_message}
         />
         {/* message pop up */}
         {!isEmpty(message) && (
            <Alert
               variant={message.variant}
               className={`message message-${message.variant}`}
            >
               {message.message}
            </Alert>
         )}
      </>
   );
}

MyApp.propTypes = {
   Component: PropTypes.func,
   pageProps: PropTypes.object,
};

export default MyApp;
