"use client";
import * as React from "react";
const Blockquote = React.forwardRef(function Blockquote(props, ref) {
  return React.createElement("blockquote", { ...props, ref: ref });
});
export default Blockquote;
