import React from "react";
import NavBar from "../ui/NavBar";
import actions from "../../store/actions";
import { connect } from "react-redux";
import axios from "axios";
import toDisplayDate from "date-fns/format";
import Pick from "../ui/Pick";

const group_id = "3fd8d78c-8151-4145-b276-aea3559deb76";
const season = 2020;
const week = 1;

class MyPicks extends React.Component {
   constructor(props) {
      super(props); // boilerplate line that needs to be in the constructor

      this.state = {};
   }

   // this is a "lifecycle" method like render(), we don't need to call it manually
   componentDidMount() {
      this.getMyPicks();
   }

   getMyPicks() {
      // get my picks from the API
      axios
         .get(
            `/api/v1/picks?group_id=${group_id}&season=${season}&week=${week}`
         )
         .then((res) => {
            // send the sponsorships to Redux
            this.props.dispatch({
               type: actions.STORE_MY_PICKS,
               payload: res.data,
            });
         })
         .catch((err) => {
            const data = err.response.data;
            console.log("err", data);
         });
   }

   // sends an API call to make a new user and if successful, pushes to new page depending on the type of user
   // works with any user type
   // makePick(game, pick) {
   //    // post to API
   //    axios
   //       .put("/api/v1/picks", user) // put to this endpoint the user object we just made
   //       .then((res) => {})
   //       .catch((err) => {});
   // }

   render() {
      let rollingDate = 0; // for keeping track when a game is on a new date
      let renderDate = true;
      let renderTime = true;
      return (
         <>
            <NavBar />
            <div className="container">
               <div className="row">
                  <div className="col col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                     <div className="card mt-5 mb-5">
                        <div className="card-header">
                           <h2>My Picks For Week {week}</h2>
                        </div>
                        <div className="card-body">
                           {this.props.myPicks.map((pick) => {
                              if (pick.game_at > rollingDate + 43200000) {
                                 renderDate = true;
                                 renderTime = true;
                              } else if (pick.game_at > rollingDate) {
                                 renderDate = false;
                                 renderTime = true;
                              } else {
                                 renderDate = false;
                                 renderTime = false;
                              }
                              rollingDate = pick.game_at;
                              return (
                                 <>
                                    {renderTime && <br />}
                                    {renderDate && (
                                       <h5 align="center">
                                          {toDisplayDate(
                                             pick.game_at,
                                             "EEE MMM dd"
                                          )}
                                       </h5>
                                    )}
                                    {renderTime && (
                                       <h6 align="center">
                                          {toDisplayDate(pick.game_at, "p")}
                                       </h6>
                                    )}
                                    <Pick pick={pick} />
                                 </>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { myPicks: state.myPicks };
}

export default connect(mapStateToProps)(MyPicks);
