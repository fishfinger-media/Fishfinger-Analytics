"use client";
import React from "react";
function hasValue(str) {
  if (typeof str !== "string") return false;
  return str.replace(/^[s ]+|[s ]+$/g, "").length > 0;
}
const FormSelect = React.forwardRef(function FormSelect(
  { options, className = "", ...props },
  ref
) {
  return React.createElement(
    "select",
    { className: className + " w-select", ...props, ref },
    options.map(({ v, t }, index) =>
      React.createElement(
        "option",
        { key: index, value: hasValue(v) ? v : "" },
        hasValue(t) ? t : ""
      )
    )
  );
});
export default FormSelect;
