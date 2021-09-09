import React from "react";

export default function Input({
   name,
   label,
   type = "text",
   placeholder = "",
   max_length, // optional
   error_message,
   style = {},
}) {
   return (
      <div className="form-group">
         <label htmlFor={`${name}-input`}>{label}</label>
         <input
            type={type}
            className="form-control"
            id={`${name}-input`}
            placeholder={placeholder}
            maxLength={max_length}
            style={style}
         />
         {error_message && <div className="text-danger">{error_message}</div>}
      </div>
   );
}
