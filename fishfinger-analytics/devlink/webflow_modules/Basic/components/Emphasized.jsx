"use client";
import * as React from "react";
const Emphasized = React.forwardRef(function Emphasized(props, ref) {
  return React.createElement("em", { ...props, ref: ref });
});
export default Emphasized;
