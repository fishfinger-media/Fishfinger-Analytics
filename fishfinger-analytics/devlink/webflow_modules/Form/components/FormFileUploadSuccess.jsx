"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadSuccess = React.forwardRef(function FormFileUploadSuccess(
  { className = "", ...props },
  ref
) {
  const { files, error } = React.useContext(FileUploadContext);
  return React.createElement("div", {
    className: className + " w-file-upload-success",
    ...props,
    ref,
    style: {
      ...props.style,
      display: Boolean(files) && !error ? "block" : "none",
    },
  });
});
export default FormFileUploadSuccess;
