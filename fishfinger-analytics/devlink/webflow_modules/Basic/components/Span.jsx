"use client";
import * as React from "react";
const Span = React.forwardRef(function Span(props, ref) {
  return React.createElement("span", { ...props, ref: ref });
});
export default Span;
