"use client";
import * as React from "react";
const RichText = React.forwardRef(function RichText(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-richtext",
    ...props,
    ref,
  });
});
export default RichText;
