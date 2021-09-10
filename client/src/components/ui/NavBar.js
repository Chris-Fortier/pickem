import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import actions from "../../store/actions";
import { connect } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Alert from "react-bootstrap/Alert";
import NavDropdown from "react-bootstrap/NavDropdown";
import isEmpty from "lodash/isEmpty";
import axios from "axios";
import {
   log_out_current_user,
   get_week_or_season_text,
   get_num_regular_season_weeks,
} from "../../utils/helpers";
import uuid from "uuid";

// sets the users position when they refresh the page
const DEFAULT_GROUP_SEASON_WEEK = {
   group_id: "3fd8d78c-8151-4145-b276-aea3559deb76",
   season: 2021,
   week: 1, // Math.floor((Date.now() - 1599634800000) / 604800000 + 1), // set the week to how many Wednesdays have started since 9/9/2020 in PDT (9/9 is 1599634800000)
};

const SEASONS = [2020, 2021];

const WEEKS = [
   "%",
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10,
   11,
   12,
   13,
   14,
   15,
   16,
   17,
   18,
   19,
   20,
   21,
   22,
]; // the WEEKS the user can select from
// TODO: make this range based on the games data somehow

function NavBar({ current_user, group_season_week, message, dispatch }) {
   // NOTE this stuff used to be in componentDidMount() when it was a class component
   useEffect(() => {
      if (isEmpty(current_user)) {
         // if there is no user, send to landing page
         window.location.href = "/";
      }

      // set the default group_season_week if there is no data there
      // do not run this if on account-settings tab
      if (window.location.pathname !== "/account-settings") {
         if (isEmpty(group_season_week)) {
            dispatch({
               type: actions.SET_GROUP_SEASON_WEEK,
               payload: DEFAULT_GROUP_SEASON_WEEK,
            });

            get_data(DEFAULT_GROUP_SEASON_WEEK);
         } else {
            get_data(group_season_week);
         }
      }
      // eslint-disable-next-line
   }, []);
   // TODO: React Hook useEffect has missing dependencies: 'current_user', 'dispatch', 'get_data', and 'group_season_week'. Either include them or remove the dependency array. If 'dispatch' changes too often, find the parent component that defines it and wrap that definition in useCallback

   // change any property in the group_season_week
   // pass it an object with any of these properties: group_id, season and/or week
   // any values it has will be pushed to group_season_week in Redux
   function change_group_season_week(new_values = {}) {
      // if there is a group_id value, change the group_id
      if (new_values.group_id !== undefined) {
         group_season_week.group_id = new_values.group_id;
      }
      // if there is a season value, change the season
      if (new_values.season !== undefined) {
         group_season_week.season = new_values.season;
      }
      // if there is a week value, change the week
      if (new_values.week !== undefined) {
         group_season_week.week = new_values.week;
      }
      // push changes to the Redux store
      dispatch({
         type: actions.SET_GROUP_SEASON_WEEK,
         payload: group_season_week,
      });
      // get new data based on the new group_season_week
      get_data(group_season_week);
   }

   // gets the data based on the group, season and week being viewed and also what page the user is on
   function get_data(group_season_week) {
      // display a message until we get data back from the server
      dispatch({
         type: actions.STORE_WARNING_MESSAGE,
         payload:
            "Getting data from the server... If this takes awhile the server might be waking up.",
      });

      // get the group picks if on that page
      if (window.location.pathname === "/group-picks") {
         axios
            .get(
               `/api/v1/picks/group-week?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               // send the data to state of component

               // process the data into an array of objects (one object per game with a pick for each user)

               const game_user_picks = res.data; // the data from server (one object for every combination of user and game)
               const match_ups = []; // an array of objects (one object per game with a pick for each user)
               const game_ids = [];
               let num_completed_games = 0;

               // an array of teams that stores user id as well as initials
               let teams = [
                  {
                     user_id: current_user.id,
                     initials: current_user.initials,
                     num_picks: 0, // stores the number of picks for this team in the week
                  }, // initialize with the current user so they are the first column when group picks are displayed
               ];

               for (let i in game_user_picks) {
                  // if this team isn't in the list already
                  const this_team = teams.find((team) => {
                     return team.user_id === game_user_picks[i].user_id;
                  }); // stores this team

                  // this counts as a pick if its not a null pick
                  let this_pick_count = 0;
                  if (game_user_picks[i].pick !== null) {
                     this_pick_count = 1;
                  }

                  if (this_team === undefined) {
                     // add a new team
                     teams.push({
                        user_id: game_user_picks[i].user_id,
                        initials: game_user_picks[i].user_initials,
                        num_picks: this_pick_count, // count this pick if its a real pick
                     });
                  } else {
                     this_team.num_picks += this_pick_count; // count this pick if its a real pick
                  }

                  // if this game_user_pick refers to a new game
                  if (!game_ids.includes(game_user_picks[i].game_id)) {
                     // make a new match up and put the data for the game in it
                     game_ids.push(game_user_picks[i].game_id);
                     match_ups.push({
                        title: `${game_user_picks[i].away_team} @ ${game_user_picks[i].home_team}`,
                        game_id: game_user_picks[i].game_id,
                        game_at: game_user_picks[i].game_at,
                        winner: game_user_picks[i].winner,
                        picks: {}, // empty object to store all the picks as key (user_id) value (pick) pairs
                     });
                     if (game_user_picks[i].winner !== null) {
                        num_completed_games++;
                     }
                  }

                  // set the label of the pick
                  let pick_label = "";
                  if (game_user_picks[i].pick === 0) {
                     pick_label = game_user_picks[i].away_team;
                  } else if (game_user_picks[i].pick === 1) {
                     pick_label = game_user_picks[i].home_team;
                  } else if (game_user_picks[i].pick === 2) {
                     pick_label = "pick";
                  } else if (game_user_picks[i].pick === null) {
                     pick_label = "-";
                  }

                  // get the result of the pick
                  let pick_result = null;
                  if (game_user_picks[i].winner !== null) {
                     if (
                        game_user_picks[i].pick === game_user_picks[i].winner
                     ) {
                        pick_result = true;
                     } else {
                        pick_result = false;
                     }
                  }

                  // find the match_up that this game_user_pick refers to and add the pick to it
                  match_ups.find((match_up) => {
                     return match_up.game_id === game_user_picks[i].game_id;
                  }).picks[game_user_picks[i].user_id] = {
                     pick: game_user_picks[i].pick,
                     pick_label,
                     pick_result,
                  };
               }

               // filter out teams that have no picks and are not the current user
               teams = teams.filter((team) => {
                  return team.user_id === current_user.id || team.num_picks > 0;
               });

               // go through each matchup and flag the ones that are on new dates
               let current_date_at = null;
               for (let m of match_ups) {
                  if (
                     m.game_at - current_date_at > 12 * 3600000 ||
                     current_date_at === null
                  ) {
                     m.is_new_date = true;
                     current_date_at = m.game_at;
                  } else {
                     m.is_new_date = false;
                  }
               }

               dispatch({
                  type: actions.STORE_GROUP_PICKS,
                  payload: {
                     teams,
                     match_ups,
                     num_completed_games,
                  },
               });

               // clear the server message
               dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               const data = err.response.data;
               console.log("err", data);

               // post an error message
               dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments.",
               });
            });
      } else if (window.location.pathname === "/my-picks") {
         // if on the my picks page get my picks
         axios
            .get(
               `/api/v1/picks?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               // send the data to Redux
               dispatch({
                  type: actions.STORE_MY_PICKS,
                  payload: res.data,
               });

               // clear the server message
               dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               const data = err.response.data;
               console.log("err", data);

               // post an error message
               dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments.",
               });
            });
      } else if (window.location.pathname === "/standings") {
         // if on the standings page get standings
         axios
            .get(
               `/api/v1/picks/standings?group_id=${group_season_week.group_id}&season=${group_season_week.season}&week=${group_season_week.week}`
            )
            .then((res) => {
               const standings = res.data;
               // get derived standings data
               if (standings.length > 0) {
                  let current_rank = 1;
                  let current_num_correct = standings[0].num_correct;
                  let is_new_rank = true; // if true will style with a border above it to separate tied teams
                  const leader_num_correct = standings[0].num_correct;
                  for (let i in standings) {
                     console.log({ i });
                     if (
                        standings[i].num_correct < current_num_correct ||
                        i === "0"
                     ) {
                        console.log("new rank");
                        current_rank = Number(i) + 1;
                        current_num_correct = standings[i].num_correct;
                        console.log("i + 1", current_rank);
                        is_new_rank = true;
                     } else {
                        is_new_rank = false;
                     }
                     standings[i].rank = current_rank;
                     standings[i].num_behind =
                        standings[i].num_correct - leader_num_correct;
                     standings[i].is_new_rank = is_new_rank;
                     console.log(
                        i,
                        standings[i].team_name,
                        standings[i].rank,
                        standings[i].is_new_rank
                     );
                  }
               }
               // send the data to Redux
               dispatch({
                  type: actions.STORE_STANDINGS,
                  payload: res.data,
               });

               // clear the server message
               dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               console.log(err);
               // post an error message
               dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. You might have a connection issue or the server needs to wake up. Try again in a few moments.",
               });
            });
      } else if (window.location.pathname === "/enter-scores") {
         // clear the server message
         // the data for enter-scores is handled on its own page
         dispatch({
            type: actions.CLEAR_MESSAGE,
         });
      }
   }

   // get the title for the page nav drop down menu
   let page_nav_title;
   if (window.location.pathname === "/my-picks") {
      page_nav_title = "My Picks";
   } else if (window.location.pathname === "/group-picks") {
      page_nav_title = "Group Picks";
   } else if (window.location.pathname === "/standings") {
      page_nav_title = "Standings";
   } else if (window.location.pathname === "/account-settings") {
      page_nav_title = "Picks/Standings";
   }

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
            <Navbar.Brand href="/">Hawk Nation NFL Pick 'em</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
               {false && (
                  <Nav className="mr-auto">
                     {/* Season dropdown */}
                     {window.location.pathname !== "/account-settings" && (
                        <>
                           <NavDropdown
                              title={`Season ${group_season_week.season}`}
                           >
                              {SEASONS.map((season) => {
                                 return (
                                    <NavDropdown.Item
                                       key={uuid.v4()}
                                       onClick={() => {
                                          change_group_season_week({
                                             season: season,
                                          });
                                          // TODO: if they are viewing the entire season, don't change the week
                                          if (
                                             season ===
                                             DEFAULT_GROUP_SEASON_WEEK.season
                                          ) {
                                             // if changing to the default season, also change the week to the default week
                                             change_group_season_week({
                                                week: DEFAULT_GROUP_SEASON_WEEK.week,
                                             });
                                          } else {
                                             // // if changing to a different season, set the week to 1
                                             // change_group_season_week({week: 1})
                                             // if changing to a different season, set the week to "entire season"
                                             change_group_season_week({
                                                week: "%",
                                             });
                                          }
                                       }}
                                    >
                                       {season}
                                    </NavDropdown.Item>
                                 );
                              })}
                           </NavDropdown>
                           {/* Week dropdown */}
                           <NavDropdown
                              title={get_week_or_season_text(
                                 group_season_week.week
                              )}
                           >
                              {WEEKS.filter(
                                 (week) =>
                                    week === "%" ||
                                    week <=
                                       get_num_regular_season_weeks(
                                          group_season_week.season
                                       ) +
                                          4
                              ) // the menu only shows the number of WEEKS in the season + 4 playoff WEEKS
                                 .map((week) => {
                                    return (
                                       <NavDropdown.Item
                                          key={uuid.v4()}
                                          onClick={() => {
                                             change_group_season_week({
                                                week: week,
                                             });
                                          }}
                                       >
                                          {get_week_or_season_text(
                                             week,
                                             group_season_week.season
                                          )}
                                       </NavDropdown.Item>
                                    );
                                 })}
                           </NavDropdown>
                        </>
                     )}

                     <NavDropdown
                        title={page_nav_title}
                        // id="collapsible-nav-dropdown"
                     >
                        <Link to="/my-picks" className="dropdown-item">
                           My Picks
                        </Link>
                        <Link className="dropdown-item" to="/group-picks">
                           Group Picks
                        </Link>
                        <Link to="/standings" className="dropdown-item">
                           Standings
                        </Link>
                        <Link className="dropdown-item" to="/enter-scores">
                           Enter Scores
                        </Link>
                     </NavDropdown>
                  </Nav>
               )}
               <Nav className="ml-auto">
                  <NavDropdown
                     title={current_user.user_name}
                     // id="collapsible-nav-dropdown"
                     alignRight // I added this so it doesn't expand off the page with short usernames (it adds the dropdown-menu-right class)
                     // className={classnames({
                     //    "selected-nav-page":
                     //       window.location.pathname === "/account-settings",
                     // })}
                  >
                     <Link to="/account-settings" className="dropdown-item">
                        Account Settings
                     </Link>
                     <Link
                        className="dropdown-item"
                        to="/"
                        onClick={() => {
                           log_out_current_user();
                        }}
                     >
                        Log Out
                     </Link>
                  </NavDropdown>
               </Nav>
            </Navbar.Collapse>
         </Navbar>
         {window.location.pathname !== "/account-settings" && (
            <>
               {/* season tabs */}
               <div className="nav-row">
                  <span className="nav-row-title">Season:</span>
                  {SEASONS.map((season) => (
                     <div
                        key={uuid.v4()}
                        className={`nav-tab ${
                           season === group_season_week.season &&
                           "nav-tab-current"
                        }`}
                        onClick={() => {
                           change_group_season_week({
                              season: season,
                           });
                           // TODO: if they are viewing the entire season, don't change the week
                           if (season === DEFAULT_GROUP_SEASON_WEEK.season) {
                              // if changing to the default season, also change the week to the default week
                              change_group_season_week({
                                 week: DEFAULT_GROUP_SEASON_WEEK.week,
                              });
                           } else {
                              // // if changing to a different season, set the week to 1
                              // change_group_season_week({week: 1})
                              // if changing to a different season, set the week to "entire season"
                              change_group_season_week({
                                 week: "%",
                              });
                           }
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
                           key={uuid.v4()}
                           className={`nav-tab ${
                              week === group_season_week.week &&
                              "nav-tab-current"
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
            <Link
               to="/my-picks"
               className={`nav-tab ${
                  window.location.pathname === "/my-picks" && "nav-tab-current"
               }`}
            >
               My Picks
            </Link>
            <Link
               to="/group-picks"
               className={`nav-tab ${
                  window.location.pathname === "/group-picks" &&
                  "nav-tab-current"
               }`}
            >
               Group Picks
            </Link>
            <Link
               to="/standings"
               className={`nav-tab ${
                  window.location.pathname === "/standings" && "nav-tab-current"
               }`}
            >
               Standings
            </Link>
            {/* TODO: only show this if they are an admin */}
            <Link
               to="/enter-scores"
               className={`nav-tab ${
                  window.location.pathname === "/enter-scores" &&
                  "nav-tab-current"
               }`}
            >
               Enter Scores
            </Link>
            {/* <Link
               to="/account-settings"
               className={`nav-tab ${
                  window.location.pathname === "/account-settings" &&
                  "nav-tab-current"
               }`}
            >
               Account Settings
            </Link>
            <Link
               to="/"
               onClick={() => {
                  log_out_current_user();
               }}
               className={`nav-tab`}
            >
               Log Out
            </Link> */}
         </div>
         {/* message pop up */}
         {!isEmpty(message) && (
            <Alert variant={message.variant} className="message">
               {message.message}
            </Alert>
         )}
      </>
   );
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      current_user: state.current_user,
      group_season_week: state.group_season_week,
      message: state.message,
   };
}

export default connect(mapStateToProps)(NavBar);
