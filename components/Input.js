import React from "react";

export default function Input({
   name,
   label,
   type = "text",
   placeholder = "",
   max_length, // optional
   error_message,
   style = {},
   value = "",
   set_value = () => {},
   default_value,
   min,
   max,
   inline = false,
   block = false,
   double = false,
   label_style = {},
   has_changed = false,
   set_has_changed = () => {},
   validate = () => true,
   is_valid = true,
   set_is_valid = () => {},
}) {
   let display_value;
   if (block) {
      display_value = "flex";
   } else if (inline) {
      display_value = "inline-block";
   }

   let input_background = "#e8f0fe";
   if (has_changed) {
      if (is_valid) {
         input_background = "#69be28";
      } else {
         input_background = "#aa0000";
      }
   }

   return (
      <div
         style={{
            display: display_value,
            marginBottom: "1rem",
            // display: inline && "inline-block",
         }}
      >
         {label && (
            <label
               htmlFor={`${name}-input`}
               style={{
                  marginBottom: 0,
                  width: double && "100%",
                  marginRight: (inline || block) && "10px",
                  ...label_style,
                  // marginBottom: double && ".25rem",
               }}
            >
               {label}
            </label>
         )}
         <input
            type={type}
            className="iphone-fix"
            id={`${name}-input`}
            placeholder={placeholder}
            maxLength={max_length}
            style={{
               ...style,
               flexGrow: block && 1,
               marginRight: inline && "1rem",
               padding: ".375rem .75rem",
               border: "none",
               background: input_background,
            }}
            value={value}
            defaultValue={default_value}
            min={min}
            max={max}
            onChange={() => {
               // validate new value
               const new_value = document.getElementById(`${name}-input`).value;
               if (new_value != default_value) {
                  set_has_changed(true);
               } else {
                  set_has_changed(false);
               }
               if (validate(new_value)) {
                  set_is_valid(true);
               } else {
                  set_is_valid(false);
               }
               set_value(new_value);
            }}
            onBlur={() => {
               // if not valid, set back to default value
               if (!is_valid) {
                  set_value(default_value);
                  set_has_changed(false);
                  set_is_valid(true);
               }
            }}
            // value={"hello"}
         />
         {error_message && (
            <div
               className="text-danger"
               style={{
                  display: inline && "inline-block",
                  marginRight: inline && "1rem",
                  marginLeft: block && ".5rem",
               }}
            >
               {error_message}
            </div>
         )}
      </div>
   );
}
