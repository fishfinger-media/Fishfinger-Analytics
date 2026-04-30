"use client";
import React from "react";
const FormFileUploadFile = React.forwardRef(function FormFileUploadFile(
  { className = "", ...props },
  ref
) {
  return React.createElement("div", {
    className: className + " w-file-upload-file",
    ...props,
    ref,
  });
});
export default FormFileUploadFile;
