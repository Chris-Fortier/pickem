import React from "react";
// import { Link } from "react-router-dom";
import actions from "../../store/actions";
import { connect } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";

class NavBar extends React.Component {
   logOutCurrentUser() {
      // clear the user from Redux
      this.props.dispatch({
         type: actions.UPDATE_CURRENT_USER,
         payload: {}, // empty user object
      });
   }

   render() {
      return (
         <>
            {/* React-Bootstrap navbar */}
            {/* changed expand from lg to md */}
            <Navbar
               collapseOnSelect
               expand="md"
               bg="dark"
               variant="dark"
               expanded // I adding this so the menu is always expanded, even with a smaller screen size
            >
               <Navbar.Brand href="#home">
                  Hawk Nation NFL Pick 'em
               </Navbar.Brand>
               {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" /> */}
               <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                     {/* <Nav.Link href="/streamer-opportunities">
                        My Picks
                     </Nav.Link>
                     <Nav.Link href="/streamer-sponsorships">
                        Leader Board
                     </Nav.Link> */}
                  </Nav>
                  <Nav>
                     <NavDropdown
                        title={this.props.currentUser.user_name}
                        id="collapsible-nav-dropdown"
                        alignRight // I added this so it doesn't expand off the page with short usernames (it adds the dropdown-menu-right class)
                     >
                        <NavDropdown.Item href="/account-settings">
                           Account Settings
                        </NavDropdown.Item>
                        <NavDropdown.Item href="/">Log Out</NavDropdown.Item>
                     </NavDropdown>
                  </Nav>
               </Navbar.Collapse>
            </Navbar>
         </>
      );
   }
}

// maps the Redux store/state to props
function mapStateToProps(state) {
   return { currentUser: state.currentUser };
}

export default connect(mapStateToProps)(NavBar);
