"use client";
import * as React from "react";
const Superscript = React.forwardRef(function Superrscript(props, ref) {
  return React.createElement("sup", { ...props, ref: ref });
});
export default Superscript;
