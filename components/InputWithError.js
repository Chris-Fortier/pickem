import React from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

// a form component that includes a label, input and support for a validation error message
export default function InputWithError({
   label, // label next to the input
   input_type = "text",
   input_value, // the value the input shows
   placeholder = "",
   set_value, // function to set the value that the input stores
   set_error = () => {}, // needed so it can clear the error when the user types into the input
   error, // if this is not blank, it will print the validation error
   is_validated,
   set_is_validated = () => {},
   note = "",
   press_enter_function = () => {}, // function to execute when they press enter in this input
}) {
   return (
      <Form.Group>
         <Form.Label>{label}</Form.Label>
         <Form.Control
            isValid={is_validated && !error}
            isInvalid={error}
            type={input_type}
            placeholder={placeholder}
            value={input_value}
            onChange={(e) => {
               set_value(e.target.value);
               set_error("");
               set_is_validated(false);
            }}
            onKeyPress={(e) => {
               // if they pressed the enter key do this function
               if (e.code === "Enter") {
                  press_enter_function();
               }
            }}
         />
         <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
         {note && <Form.Text className="text-muted">{note}</Form.Text>}
      </Form.Group>
   );
}

InputWithError.propTypes = {
   label: PropTypes.string,
   input_type: PropTypes.string,
   input_value: PropTypes.string,
   placeholder: PropTypes.string,
   set_value: PropTypes.func,
   set_error: PropTypes.func,
   error: PropTypes.string,
   is_validated: PropTypes.bool,
   set_is_validated: PropTypes.func,
   note: PropTypes.string,
   press_enter_function: PropTypes.func,
};
