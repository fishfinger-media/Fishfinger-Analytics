"use client";
import * as React from "react";
const Column = React.forwardRef(function Column(
  { tag = "div", className = "", columnClasses = "", ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-col " + columnClasses,
    ...props,
    ref,
  });
});
export default Column;
