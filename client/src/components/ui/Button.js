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
}) {
   return (
      <div
         type={type}
         className={classnames(`btn ${className}`, {
            "btn-block": block,
            "btn-primary": primary,
            "btn-secondary": secondary,
            "btn-danger": danger,
            "text-danger": warning,
            "mt-3 mr-2": !block,
         })}
         onClick={action}
         style={style}
      >
         {label}
      </div>
   );
}
