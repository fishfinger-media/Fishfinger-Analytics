"use client";
import React from "react";
import { onKeyDownInputHandlers } from "../helpers/formUtils";
const FormTextarea = React.forwardRef(function FormTextarea(
  { className = "", ...props },
  ref
) {
  return React.createElement("textarea", {
    ...props,
    className: className + " w-input",
    onKeyDown: onKeyDownInputHandlers,
    ref,
  });
});
export default FormTextarea;
