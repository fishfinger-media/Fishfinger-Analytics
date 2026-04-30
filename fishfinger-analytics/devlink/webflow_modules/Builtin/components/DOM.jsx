"use client";
import * as React from "react";
const DOM = React.forwardRef(function DOM(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    className,
    ...props,
    ref,
  });
});
export default DOM;
