"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadFileName = React.forwardRef(function FormFileUploadFileName(
  { className = "", ...props },
  ref
) {
  const { files } = React.useContext(FileUploadContext);
  return React.createElement(
    "div",
    {
      className: className + " w-file-upload-file-name",
      ...props,
      ref,
    },
    files?.[0]?.name ?? ""
  );
});
export default FormFileUploadFileName;
