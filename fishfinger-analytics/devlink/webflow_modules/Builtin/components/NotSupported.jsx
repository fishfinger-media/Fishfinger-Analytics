"use client";
import * as React from "react";
const NotSupported = React.forwardRef(function NotSupported(
  { _atom = "" },
  ref
) {
  return React.createElement(
    "div",
    { ref: ref },
    `This builtin is not currently supported: ${_atom}`
  );
});
export default NotSupported;
