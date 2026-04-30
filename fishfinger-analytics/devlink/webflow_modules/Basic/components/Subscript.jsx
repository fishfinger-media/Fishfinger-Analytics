"use client";
import * as React from "react";
const Subscript = React.forwardRef(function Subscript(props, ref) {
  return React.createElement("sub", { ...props, ref: ref });
});
export default Subscript;
