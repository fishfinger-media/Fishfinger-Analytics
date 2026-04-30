"use client";
import React from "react";
const FormFileUploadUploadingBtn = React.forwardRef(
  function FormFileUploadUploadingBtn({ className = "", ...props }, ref) {
    return React.createElement("div", {
      className: className + " w-file-upload-uploading-btn",
      ...props,
      ref,
    });
  }
);
export default FormFileUploadUploadingBtn;
