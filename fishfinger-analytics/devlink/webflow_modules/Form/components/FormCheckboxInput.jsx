"use client";
import React from "react";
import FormBooleanInput from "./FormBooleanInput";
const FormCheckboxInput = React.forwardRef(function FormCheckboxInput(
  { className = "", ...props },
  ref
) {
  return React.createElement(FormBooleanInput, {
    ...props,
    ref: ref,
    type: "checkbox",
    className: className + " w-checkbox-input",
  });
});
export default FormCheckboxInput;
