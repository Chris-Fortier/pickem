import React from "react";
import classnames from "classnames";

export default function Button({
   label,
   action,
   block = false,
   primary = false,
   secondary = false,
   warning = false,
   danger = false,
   type = "button",
   style = {},
   className = "",
   is_enabled = true,
}) {
   let display_value;
   if (block) {
      display_value = "flex";
   } else {
      display_value = "inline-block";
   }
   return (
      <div
         style={{
            display: display_value,
            marginBottom: "1rem",
            marginRight: !block && "1rem",
            // display: inline && "inline-block",
            ...style,
         }}
      >
         <div
            type={type}
            className={classnames(`btn iphone-fix ${className}`, {
               "btn-block": block,
               "btn-primary": primary,
               "btn-secondary": secondary,
               "btn-danger": danger,
               "text-danger": warning,
               disabled: !is_enabled,
               // "mt-3 mr-2": !block,
            })}
            onClick={
               is_enabled
                  ? action
                  : () => {
                       console.log("This button is is disabled.");
                    }
            }
         >
            {label}
         </div>
      </div>
   );
}
