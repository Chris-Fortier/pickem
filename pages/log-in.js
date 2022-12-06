import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Container } from "react-bootstrap";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import InputWithError from "../components/InputWithError";
import log_in from "../utils/log_in";

// the log in page
export default function Login({ set_user }) {
   const router = useRouter();

   const [user_name_input, set_user_name_input] = useState("");
   const [password_input, set_password_input] = useState("");
   const [current_user_name_error, set_current_user_name_error] = useState("");
   const [current_password_error, set_current_password_error] = useState("");
   const [current_user_name_is_validated, set_current_user_name_is_validated] =
      useState(false);
   const [current_password_is_validated, set_current_password_is_validated] =
      useState(false);

   function set_is_validated(value) {
      set_current_user_name_is_validated(value);
      set_current_password_is_validated(value);
   }

   // tests if the user_name and password are valid and if so logs in
   async function validate_and_log_in_user() {
      const user = {
         name: user_name_input,
         password: password_input, // send the plain text password over secure connection, the server will hash it
      };
      axios
         .post("/api/users/auth", user)
         .then((res) => {
            console.log({ res });
            // what happens when the user logs in
            set_current_user_name_error("");
            set_current_password_error("");
            log_in({
               access_token: res.data.access_token,
               router,
               set_user,
            });
            set_is_validated(true);
         })
         .catch((err) => {
            console.log(err);
            const { data } = err.response;

            // push errors or lack thereof to state
            set_current_user_name_error(data.current_user_name_error);
            set_current_password_error(data.current_password_error);
            set_is_validated(true);
         });
   }

   function validate_and_log_in_user_if_they_entered_something_in_both_fields() {
      if (user_name_input && password_input) {
         validate_and_log_in_user();
      }
   }

   return (
      <Container>
         <h1>
            Hawk Nation
            <br />
            NFL Pick 'em
         </h1>
         <div className="my-card">
            <div className="card-header">
               <h2>Log In</h2>
            </div>
            <div className="card-body">
               <InputWithError
                  label="User Name"
                  input_type="text"
                  input_value={user_name_input}
                  set_value={set_user_name_input}
                  set_error={set_current_user_name_error}
                  error={current_user_name_error}
                  is_validated={current_user_name_is_validated}
                  set_is_validated={set_current_user_name_is_validated}
                  press_enter_function={() => {
                     validate_and_log_in_user_if_they_entered_something_in_both_fields();
                  }}
               />
               <InputWithError
                  label="Password"
                  input_type="password"
                  input_value={password_input}
                  set_value={set_password_input}
                  set_error={set_current_password_error}
                  error={current_password_error}
                  is_validated={current_password_is_validated}
                  set_is_validated={set_current_password_is_validated}
                  press_enter_function={() => {
                     validate_and_log_in_user_if_they_entered_something_in_both_fields();
                  }}
               />
               <Button
                  variant="primary"
                  // type="submit"
                  onClick={() => validate_and_log_in_user()}
                  className="mt-3"
               >
                  Log In
               </Button>
            </div>
         </div>
      </Container>
   );
}

Login.propTypes = {
   set_user: PropTypes.func,
   set_user_categories: PropTypes.func,
};
