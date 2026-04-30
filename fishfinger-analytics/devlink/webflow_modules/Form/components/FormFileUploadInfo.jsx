"use client";
import React from "react";
const FormFileUploadInfo = React.forwardRef(function FormFileUploadInfo(
  { className = "", ...props },
  ref
) {
  return React.createElement("div", {
    className: className + " w-file-upload-info",
    ...props,
    ref,
  });
});
export default FormFileUploadInfo;
