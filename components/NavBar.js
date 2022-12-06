import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
   get_week_or_season_text,
   get_num_regular_season_weeks,
   SEASONS,
   WEEKS,
   DEFAULT_GROUP_SEASON_WEEK,
} from "../utils/client_helpers";
import { v4 } from "uuid";
import log_out from "../utils/log_out";

export default function NavBar({
   user,
   group_season_week,
   set_group_season_week,
   set_user,
}) {
   const router = useRouter();
   // change any property in the group_season_week
   // pass it an object with any of these properties: group_id, season and/or week
   // any values it has will be pushed to group_season_week in Redux
   function change_group_season_week(new_values = {}) {
      set_group_season_week({ ...group_season_week, ...new_values });
   }

   // const pathname = window.location.pathname
   const pathname = router.pathname;

   return (
      <>
         {/* React-Bootstrap navbar */}
         {/* changed expand from lg to md */}
         <Navbar
            collapseOnSelect
            expand="sm"
            bg="dark"
            variant="dark"
            // expanded // I adding this so the menu is always expanded, even with a smaller screen size
         >
            <Container fluid>
               <Navbar.Brand>Hawk Nation NFL Pick &apos;em</Navbar.Brand>
               <Navbar.Toggle aria-controls="responsive-navbar-nav" />
               <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="ml-auto">
                     <NavDropdown
                        style={{ right: 0, left: "auto" }}
                        title={user.user_name}
                        // alignRight
                        className="dropdown-menu-right"
                        // id="collapsible-nav-dropdown"
                        // alignRight // I added this so it doesn't expand off the page with short usernames (it adds the dropdown-menu-right class)
                        // className={classnames({
                        //    "selected-nav-page":
                        //       pathname === "/account-settings",
                        // })}
                     >
                        <span className="dropdown-item">
                           <Link href="/account-settings">
                              Account Settings
                           </Link>
                        </span>
                        <NavDropdown.Item
                           className="dropdown-item"
                           href="/log-in"
                           onClick={() => {
                              log_out({ set_user, router });
                           }}
                        >
                           Log Out
                        </NavDropdown.Item>
                     </NavDropdown>
                  </Nav>
               </Navbar.Collapse>
            </Container>
         </Navbar>
         {pathname !== "/account-settings" && (
            <>
               {/* season tabs */}
               <div className="nav-row">
                  <span className="nav-row-title">Season:</span>
                  {SEASONS.map((season) => (
                     <div
                        key={v4()}
                        className={`nav-tab${
                           season === group_season_week.season
                              ? " nav-tab-current"
                              : ""
                        }`}
                        onClick={() => {
                           const new_values = { season: season };
                           // TODO: if they are viewing the entire season, don't change the week
                           if (season === DEFAULT_GROUP_SEASON_WEEK.season) {
                              // if changing to the default season, also change the week to the default week
                              new_values["week"] =
                                 DEFAULT_GROUP_SEASON_WEEK.week;
                           } else {
                              // if changing to a different season, set the week to "entire season"
                              new_values["week"] = "%";
                           }
                           change_group_season_week(new_values);
                        }}
                     >
                        {season}
                     </div>
                  ))}
               </div>
               {/* week tabs */}
               <div className="nav-row">
                  <span className="nav-row-title">Week:</span>
                  {WEEKS.filter(
                     (week) =>
                        week === "%" ||
                        week <=
                           get_num_regular_season_weeks(
                              group_season_week.season
                           ) +
                              4
                  ) // the menu only shows the number of WEEKS in the season + 4 playoff WEEKS
                     .map((week) => (
                        <div
                           key={v4()}
                           className={`nav-tab${
                              week === group_season_week.week
                                 ? " nav-tab-current"
                                 : ""
                           }`}
                           onClick={() => {
                              change_group_season_week({
                                 week: week,
                              });
                           }}
                        >
                           {get_week_or_season_text(
                              week,
                              group_season_week.season,
                              true
                           )}
                        </div>
                     ))}
               </div>
            </>
         )}

         {/* view tabs */}
         <div className="nav-row">
            <span className="nav-row-title">View:</span>
            <span
               className={`nav-tab${
                  pathname === "/my-picks" ? " nav-tab-current" : ""
               }`}
            >
               <Link href="/my-picks">My Picks</Link>
            </span>
            <span
               className={`nav-tab${
                  pathname === "/group-picks" ? " nav-tab-current" : ""
               }`}
            >
               <Link href="/group-picks">Group Picks</Link>
            </span>
            <span
               className={`nav-tab${
                  pathname === "/standings" ? " nav-tab-current" : ""
               }`}
            >
               <Link href="/standings">Standings</Link>
            </span>
            {/* only show this if they are an admin */}
            {user.is_admin === 1 && (
               <span
                  className={`nav-tab${
                     pathname === "/enter-scores" ? " nav-tab-current" : ""
                  }`}
               >
                  <Link href="/enter-scores">Enter Scores</Link>
               </span>
            )}
         </div>
      </>
   );
}
