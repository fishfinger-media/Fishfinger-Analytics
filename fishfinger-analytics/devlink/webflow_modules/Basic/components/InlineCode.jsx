"use client";
import * as React from "react";
const InlineCode = React.forwardRef(function InlineCode(props, ref) {
  return React.createElement("code", { ...props, ref: ref });
});
export default InlineCode;
