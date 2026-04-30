"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadError = React.forwardRef(function FormFileUploadError(
  { className = "", ...props },
  ref
) {
  const { error } = React.useContext(FileUploadContext);
  return React.createElement("div", {
    className: className + " w-file-upload-error",
    ...props,
    ref,
    style: {
      ...props.style,
      display: error ? "block" : "none",
    },
  });
});
export default FormFileUploadError;
