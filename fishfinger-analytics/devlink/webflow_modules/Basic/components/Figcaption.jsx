"use client";
import * as React from "react";
const Figcaption = React.forwardRef(function Figcaption(props, ref) {
  return React.createElement("figcaption", { ...props, ref: ref });
});
export default Figcaption;
