"use client";
import React from "react";
import FormBooleanInput from "./FormBooleanInput";
const FormRadioInput = React.forwardRef(function FormRadioInput(
  { className = "", ...props },
  ref
) {
  return React.createElement(FormBooleanInput, {
    ...props,
    ref: ref,
    type: "radio",
    className: className + " w-radio-input",
  });
});
export default FormRadioInput;
