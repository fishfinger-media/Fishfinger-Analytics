"use client";
import React from "react";
const FormFileUploadText = React.forwardRef(function FormFileUploadText(
  { className = "", ...props },
  ref
) {
  return React.createElement("div", {
    className: className + " w-inline-block",
    ...props,
    ref,
  });
});
export default FormFileUploadText;
