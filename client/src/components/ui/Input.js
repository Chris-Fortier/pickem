import React from "react";

export default function Input({
   name,
   label,
   type = "text",
   placeholder = "",
   max_length, // optional
   error_message,
   style = {},
   default_value,
   min,
   max,
   inline = false,
   block = false,
   double = false,
   label_style = {},
}) {
   let display_value;
   if (block) {
      display_value = "flex";
   } else if (inline) {
      display_value = "inline-block";
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
            // className="form-control"
            id={`${name}-input`}
            placeholder={placeholder}
            maxLength={max_length}
            style={{
               ...style,
               width: double && "100%",
               flexGrow: block && 1,
               marginRight: inline && "1rem",
               padding: ".375rem .75rem",
               border: "none",
               background: "#e8f0fe",
            }}
            defaultValue={default_value}
            min={min}
            max={max}
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
