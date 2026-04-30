"use client";
import React from "react";
import {
  FileUploadContext,
  MAX_FILE_SIZE_DEFAULT,
} from "../helpers/fileUploadContext";
export const _FormFileUploadWrapper = React.forwardRef(
  function _FormFileUploadWrapper({ className = "", ...props }, ref) {
    return React.createElement("div", {
      className: className + " w-file-upload",
      ...props,
      ref,
    });
  }
);
const FormFileUploadWrapper = React.forwardRef(function FormFileUploadWrapper(
  { maxSize = MAX_FILE_SIZE_DEFAULT, ...props },
  ref
) {
  const [files, setFiles] = React.useState(null);
  const [error, setError] = React.useState(null);
  return React.createElement(
    FileUploadContext.Provider,
    {
      value: { files, setFiles, error, setError, maxSize },
    },
    React.createElement(_FormFileUploadWrapper, { ...props, ref })
  );
});
export default FormFileUploadWrapper;
