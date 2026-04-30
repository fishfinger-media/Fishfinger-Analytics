"use client";
import React from "react";
import { onKeyDownInputHandlers } from "../helpers/formUtils";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadInput = React.forwardRef(function FormFileUploadInput(
  { className = "", ...props },
  ref
) {
  const { setFiles, setError, maxSize } = React.useContext(FileUploadContext);
  return React.createElement("input", {
    ...props,
    className: className + " w-file-upload-input",
    type: "file",
    onKeyDown: onKeyDownInputHandlers,
    onChange: (e) => {
      if (e.target.files) {
        if (e.target.files[0] && e.target.files[0].size <= maxSize) {
          setError(null);
          setFiles(e.target.files);
        } else setError("SIZE_ERROR");
      }
    },
    ref,
  });
});
export default FormFileUploadInput;
