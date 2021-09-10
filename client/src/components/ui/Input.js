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
}) {
   function render_contents() {
      return (
         <>
            {label && (
               <label
                  htmlFor={`${name}-input`}
                  style={{
                     marginBottom: 0,
                     width: double && "100%",
                     marginRight: (inline || block) && "10px",
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
                  marginRight: inline && "10px",
               }}
               defaultValue={default_value}
               min={min}
               max={max}
            />
            {error_message && (
               <div className="text-danger">{error_message}</div>
            )}
         </>
      );
   }

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
            marginBottom: "10px",
            // display: inline && "inline-block",
         }}
      >
         {render_contents()}
      </div>
   );
}
