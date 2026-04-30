"use client";
import React from "react";
import { FileUploadContext } from "../helpers/fileUploadContext";
const FormFileUploadRemoveLink = React.forwardRef(
  function FormFileUploadRemoveLink({ className = "", ...props }, ref) {
    const { setFiles } = React.useContext(FileUploadContext);
    return React.createElement("div", {
      className: className + " w-file-remove-link",
      ...props,
      ref,
      onClick: () => {
        setFiles(null);
      },
    });
  }
);
export default FormFileUploadRemoveLink;
