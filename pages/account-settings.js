import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Container, Alert, Button, Accordion } from "react-bootstrap";
import InputWithError from "../components/InputWithError";
import log_out from "../utils/log_out";

function ChangeUserProperty({ user, set_user, property, input_type = "text" }) {
   const [new_value_input, set_new_value_input] = useState(
      user[property] || ""
   );
   const [new_value_error, set_new_value_error] = useState("");
   const [current_password_input, set_current_password_input] = useState("");
   const [current_password_error, set_current_password_error] = useState("");
   const [message, set_message] = useState("");
   const [current_password_is_validated, set_current_password_is_validated] =
      useState(false);
   const [new_value_is_validated, set_new_value_is_validated] = useState(false);
   const [message_variant, set_message_variant] = useState(""); // variant to use for the alert

   function set_is_validated(value) {
      set_current_password_is_validated(value);
      set_new_value_is_validated(value);
   }

   // tests if the new user value and password are valid and if so changes user value
   async function validate_and_change_user_property() {
      axios
         .patch(`/api/users/change-${property}`, {
            new_value: new_value_input,
            current_password: current_password_input,
         })
         .then((res) => {
            // update errors and message from the server
            const data = res.data;
            set_new_value_error(data.new_value_error);
            set_current_password_error(data.current_password_error);
            set_message(data.message);
            // update the current user object locally (unless its a password as we don't story that locally)
            if (input_type !== "password") {
               const new_user = { ...user };
               new_user[property] = new_value_input;
               set_user(new_user);
            }
            // clear the password input
            set_current_password_input("");
            set_is_validated(true);
            set_message_variant("success");
         })
         .catch((err) => {
            // update errors and message from the server
            const data = err.response.data;
            set_new_value_error(data.new_value_error);
            set_current_password_error(data.current_password_error);
            set_message(data.message);
            set_is_validated(true);
            set_message_variant("danger");
         });
   }

   return (
      <>
         <h4 style={{ textTransform: "capitalize" }}>Change Your {property}</h4>
         <InputWithError
            label="Enter Your Password"
            input_type="password"
            input_value={current_password_input}
            set_value={set_current_password_input}
            set_error={set_current_password_error}
            error={current_password_error}
            is_validated={current_password_is_validated}
            set_is_validated={set_current_password_is_validated}
         />
         <InputWithError
            label={`Enter a New User ${property}`}
            input_type={input_type}
            input_value={new_value_input}
            set_value={set_new_value_input}
            set_error={set_new_value_error}
            error={new_value_error}
            is_validated={new_value_is_validated}
            set_is_validated={set_new_value_is_validated}
         />
         <div>
            <Button
               variant="secondary"
               onClick={() => validate_and_change_user_property()}
               style={{ textTransform: "capitalize" }}
               className="mt-3"
            >
               Change {property}
            </Button>
         </div>
         {message && (
            <Alert variant={message_variant} className="mt-3">
               {message}
            </Alert>
         )}
      </>
   );
}

export default function AccountSettings({ user, set_user }) {
   const router = useRouter();

   const [
      current_password_input_for_account_deletion,
      set_current_password_input_for_account_deletion,
   ] = useState("");
   const [
      current_password_error_for_account_deletion,
      set_current_password_error_for_account_deletion,
   ] = useState("");
   const [current_password_is_validated, set_current_password_is_validated] =
      useState(false);

   function set_is_validated(value) {
      set_current_password_is_validated(value);
   }

   // TODO: can refactor this to map over some data and use auto generated ids for event keys

   return (
      <Container>
         <div className="my-card">
            <div className="card-header">
               <h2>Account Settings</h2>
            </div>
            <div className="card-body">
               <Accordion>
                  <Accordion.Item eventKey="0">
                     <Accordion.Header>Change Password</Accordion.Header>
                     <Accordion.Body>
                        <ChangeUserProperty
                           user={user}
                           set_user={set_user}
                           property="password"
                           input_type="password"
                        />
                     </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                     <Accordion.Header>Change User Name</Accordion.Header>
                     <Accordion.Body>
                        <ChangeUserProperty
                           user={user}
                           set_user={set_user}
                           property="user_name"
                        />
                     </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="2">
                     <Accordion.Header>Change Email</Accordion.Header>
                     <Accordion.Body>
                        <ChangeUserProperty
                           user={user}
                           set_user={set_user}
                           property="email"
                        />
                     </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="4">
                     <Accordion.Header>Change Team Name</Accordion.Header>
                     <Accordion.Body>
                        <ChangeUserProperty
                           user={user}
                           set_user={set_user}
                           property="team_name"
                        />
                     </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="5">
                     <Accordion.Header>Change Initials</Accordion.Header>
                     <Accordion.Body>
                        <ChangeUserProperty
                           user={user}
                           set_user={set_user}
                           property="initials"
                        />
                     </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="3">
                     <Accordion.Header>Delete Account</Accordion.Header>
                     <Accordion.Body>
                        <h4 style={{ textTransform: "capitalize" }}>
                           Delete Your Account
                        </h4>
                        <InputWithError
                           label="Enter Your Password"
                           input_type="password"
                           input_value={
                              current_password_input_for_account_deletion
                           }
                           set_value={
                              set_current_password_input_for_account_deletion
                           }
                           error={current_password_error_for_account_deletion}
                           set_error={
                              set_current_password_error_for_account_deletion
                           }
                           is_validated={current_password_is_validated}
                           set_is_validated={set_current_password_is_validated}
                        />
                        <Button
                           variant="danger"
                           className="mt-3"
                           onClick={() => {
                              axios
                                 .delete(
                                    "/api/users",
                                    {
                                       data: {
                                          current_password:
                                             current_password_input_for_account_deletion,
                                       },
                                    } // must send payload like this when using delete method
                                 )
                                 .then(() => {
                                    console.log("Account deleted.");
                                    log_out({ set_user, router }); // log out the user
                                    set_is_validated(true);
                                 })
                                 .catch((err) => {
                                    console.log("err", err, err.response.data);
                                    set_current_password_error_for_account_deletion(
                                       err.response.data.current_password_error
                                    );
                                    set_is_validated(true);
                                 });
                           }}
                        >
                           Delete Account
                        </Button>
                     </Accordion.Body>
                  </Accordion.Item>
               </Accordion>
            </div>
         </div>
      </Container>
   );
}
