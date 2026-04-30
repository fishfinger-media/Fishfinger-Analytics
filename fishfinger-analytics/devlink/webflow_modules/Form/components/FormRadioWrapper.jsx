"use client";
import React from "react";
const FormRadioWrapper = React.forwardRef(function FormRadioWrapper(
  { className = "", ...props },
  ref
) {
  return React.createElement("label", {
    className: className + " w-radio",
    ...props,
    ref,
  });
});
export default FormRadioWrapper;
