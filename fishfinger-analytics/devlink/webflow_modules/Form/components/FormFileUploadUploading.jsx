"use client";
import React from "react";
const FormFileUploadUploading = React.forwardRef(
  function FormFileUploadUploading({ className = "", ...props }, ref) {
    return React.createElement("div", {
      className: className + " w-file-upload-uploading",
      style: { ...props.style, display: "none" },
      ...props,
      ref,
    });
  }
);
export default FormFileUploadUploading;
