"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadErrorMsg = React.forwardRef(function FormFileUploadErrorMsg(
  { errors, className = "", ...props },
  ref
) {
  const { error } = React.useContext(FileUploadContext);
  return React.createElement(
    "div",
    {
      className: className + " w-file-upload-error-msg",
      ...props,
      ref,
    },
    errors[error ?? "GENERIC_ERROR"]
  );
});
export default FormFileUploadErrorMsg;
