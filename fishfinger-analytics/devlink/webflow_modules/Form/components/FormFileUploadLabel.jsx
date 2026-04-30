"use client";
import React from "react";
const FormFileUploadLabel = React.forwardRef(function FormFileUploadLabel(
  { className = "", ...props },
  ref
) {
  return React.createElement("label", {
    className: className + " w-file-upload-label",
    ...props,
    ref,
  });
});
export default FormFileUploadLabel;
