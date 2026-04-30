"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadDefault = React.forwardRef(function FormFileUploadDefault(
  { className = "", ...props },
  ref
) {
  const { files, error } = React.useContext(FileUploadContext);
  return React.createElement("div", {
    className: className + " w-file-upload-default",
    ...props,
    ref,
    style: {
      ...props.style,
      display: !files || error ? "block" : "none",
    },
  });
});
export default FormFileUploadDefault;
