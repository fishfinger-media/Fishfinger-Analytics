"use client";
import React from "react";
const FormInlineLabel = React.forwardRef(function FormInlineLabel(
  { className = "", ...props },
  ref
) {
  return React.createElement("span", {
    className: className + " w-form-label",
    ...props,
    ref,
  });
});
export default FormInlineLabel;
