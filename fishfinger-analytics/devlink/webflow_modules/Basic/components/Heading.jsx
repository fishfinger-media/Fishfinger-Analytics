"use client";
import * as React from "react";
const Heading = React.forwardRef(function Heading(
  { tag = "h1", ...props },
  ref
) {
  return React.createElement(tag, {
    ...props,
    ref,
  });
});
export default Heading;
