"use client";
import React from "react";
const FormFileUploadUploadingIcon = React.forwardRef(
  function FormFileUploadUploadingIcon({ className = "", ...props }, ref) {
    return React.createElement(
      "svg",
      {
        className: className + " icon w-icon-file-upload-uploading",
        ...props,
        ref,
      },
      React.createElement(
        React.Fragment,
        null,
        React.createElement("path", {
          fill: "currentColor",
          opacity: ".2",
          d: "M7.793 3.405A6 6 0 1 1 3.39 7.808l-.39.094-.39-.094A6.001 6.001 0 1 1 7.793 3.39l-.094.39.094.39Z",
        }),
        React.createElement("path", {
          fill: "currentColor",
          d: "M6.035 2.224a.4.4 0 0 1-.17-.039A5.6 5.6 0 0 0 2.25 6.25a.4.4 0 0 1-.8 0 6.4 6.4 0 0 1 4.138-5.986.4.4 0 0 1 .447.76Z",
        })
      )
    );
  }
);
export default FormFileUploadUploadingIcon;
