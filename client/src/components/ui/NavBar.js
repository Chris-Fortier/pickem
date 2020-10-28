import React from "react";
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
   logOutCurrentUser,
   get_week_or_season_text,
} from "../../utils/helpers";
import { differenceInDays } from "date-fns";

const defaultGroupSeasonWeek = {
   group_id: "3fd8d78c-8151-4145-b276-aea3559deb76",
   season: 2020,
   week: Math.floor((Date.now() - 1599634800000) / 604800000 + 1), // set the week to how many Wednesdays have started since 9/9/2020 in PDT (9/9 is 1599634800000)
};

const weeks = ["%", 1, 2, 3, 4, 5, 6, 7, 8, 9]; // the weeks the user can select from

class NavBar extends React.Component {
   // this is a "lifecycle" method like render(), we don't need to call it manually
   componentDidMount() {
      if (isEmpty(this.props.currentUser)) {
         // send the parent page to landing page
         this.props.parentProps.history.push("/");
      }

      // set the default groupSeasonWeek if there is no data there
      if (isEmpty(this.props.groupSeasonWeek)) {
         this.props.dispatch({
            type: actions.SET_GROUP_SEASON_WEEK,
            payload: defaultGroupSeasonWeek,
         });

         this.getData(defaultGroupSeasonWeek);
      } else {
         this.getData(this.props.groupSeasonWeek);
      }
   }

   // change any property in the groupSeasonWeek
   // pass it an object with any of these properties: group_id, season and/or week
   // any values it has will be pushed to groupSeasonWeek in Redux
   changeGroupSeasonWeek(new_values = {}) {
      // if there is a group_id value, change the group_id
      if (new_values.group_id !== undefined) {
         this.props.groupSeasonWeek.group_id = new_values.group_id;
      }
      // if there is a season value, change the season
      if (new_values.season !== undefined) {
         this.props.groupSeasonWeek.season = new_values.season;
      }
      // if there is a week value, change the week
      if (new_values.week !== undefined) {
         this.props.groupSeasonWeek.week = new_values.week;
      }
      // push changes to the Redux store
      this.props.dispatch({
         type: actions.SET_GROUP_SEASON_WEEK,
         payload: this.props.groupSeasonWeek,
      });
      // get new data based on the new groupSeasonWeek
      this.getData(this.props.groupSeasonWeek);
   }

   // gets the data based on the group, season and week being viewed and also what page the user is on
   getData(groupSeasonWeek) {
      // display a message until we get data back from the server
      this.props.dispatch({
         type: actions.STORE_WARNING_MESSAGE,
         payload:
            "Getting data from the server... If this takes awhile the server might be waking up.",
      });

      // get the group picks if on that page
      if (window.location.pathname === "/group-picks") {
         console.log(this.props);
         axios
            .get(
               `/api/v1/picks/group-week?group_id=${groupSeasonWeek.group_id}&season=${groupSeasonWeek.season}&week=${groupSeasonWeek.week}`
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
                     user_id: this.props.currentUser.id,
                     initials: this.props.currentUser.initials,
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
                  return (
                     team.user_id === this.props.currentUser.id ||
                     team.num_picks > 0
                  );
               });

               // go through each matchup and flag the ones that are on new dates
               let current_date_at = null;
               for (let m of match_ups) {
                  if (
                     differenceInDays(m.game_at, current_date_at) > 0 ||
                     current_date_at === null
                  ) {
                     m.is_new_date = true;
                     current_date_at = m.game_at;
                  } else {
                     m.is_new_date = false;
                  }
               }

               this.props.dispatch({
                  type: actions.STORE_GROUP_PICKS,
                  payload: {
                     teams,
                     match_ups,
                     num_completed_games,
                  },
               });

               // clear the server message
               this.props.dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               const data = err.response.data;
               console.log("err", data);

               // post an error message
               this.props.dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. The server might need to wake up. Try again in a few moments.",
               });
            });
      } else if (window.location.pathname === "/my-picks") {
         // if on the my picks page get my picks
         axios
            .get(
               `/api/v1/picks?group_id=${groupSeasonWeek.group_id}&season=${groupSeasonWeek.season}&week=${groupSeasonWeek.week}`
            )
            .then((res) => {
               // send the data to Redux
               this.props.dispatch({
                  type: actions.STORE_MY_PICKS,
                  payload: res.data,
               });

               // clear the server message
               this.props.dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               const data = err.response.data;
               console.log("err", data);

               // post an error message
               this.props.dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. The server might need to wake up. Try again in a few moments.",
               });
            });
      } else if (window.location.pathname === "/standings") {
         // if on the standings page get standings
         axios
            .get(
               `/api/v1/picks/standings?group_id=${groupSeasonWeek.group_id}&season=${groupSeasonWeek.season}&week=${groupSeasonWeek.week}`
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
               this.props.dispatch({
                  type: actions.STORE_STANDINGS,
                  payload: res.data,
               });

               // clear the server message
               this.props.dispatch({
                  type: actions.CLEAR_MESSAGE,
               });
            })
            .catch((err) => {
               console.log(err);
               // post an error message
               this.props.dispatch({
                  type: actions.STORE_DANGER_MESSAGE,
                  payload:
                     "Could not connect. The server might need to wake up. Try again in a few moments.",
               });
            });
      }
   }

   render() {
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
               <Navbar.Brand href="#home">
                  Hawk Nation NFL Pick 'em
               </Navbar.Brand>
               <Navbar.Toggle aria-controls="responsive-navbar-nav" />
               <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                     <NavDropdown
                        title={get_week_or_season_text(
                           this.props.groupSeasonWeek.week
                        )}
                        // id="collapsible-nav-dropdown"
                        // alignRight // I added this so it doesn't expand off the page with short usernames (it adds the dropdown-menu-right class)
                     >
                        {weeks.map((week) => {
                           return (
                              <NavDropdown.Item
                                 onClick={() => {
                                    this.changeGroupSeasonWeek({ week: week });
                                 }}
                              >
                                 {get_week_or_season_text(week)}
                              </NavDropdown.Item>
                           );
                        })}
                     </NavDropdown>
                     {/* <Nav.Link href="/my-picks">My Picks</Nav.Link>
                     <Nav.Link href="/group-picks">Group Picks</Nav.Link> */}
                     {/* using standard react-router Link makes it not refresh the page when loading */}
                     {/* <Link
                        to="/my-picks"
                        className={classnames({
                           "nav-link": true,
                           "selected-nav-page":
                              window.location.pathname === "/my-picks",
                        })}
                     >
                        My Picks
                     </Link>
                     <Link
                        to="/group-picks"
                        className={classnames({
                           "nav-link": true,
                           "selected-nav-page":
                              window.location.pathname === "/group-picks",
                        })}
                     >
                        Group Picks
                     </Link>
                     <Link
                        to="/standings"
                        className={classnames({
                           "nav-link": true,
                           "selected-nav-page":
                              window.location.pathname === "/standings",
                        })}
                     >
                        Standings
                     </Link> */}
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
                     </NavDropdown>
                  </Nav>
                  <Nav>
                     <NavDropdown
                        title={this.props.currentUser.user_name}
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
                              logOutCurrentUser();
                           }}
                        >
                           Log Out
                        </Link>
                     </NavDropdown>
                  </Nav>
               </Navbar.Collapse>
            </Navbar>
            {/* message pop up */}
            {!isEmpty(this.props.message) && (
               <Alert variant={this.props.message.variant} className="message">
                  {this.props.message.message}
               </Alert>
            )}
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return {
      currentUser: state.currentUser,
      groupSeasonWeek: state.groupSeasonWeek,
      message: state.message,
   };
}

export default connect(mapStateToProps)(NavBar);
