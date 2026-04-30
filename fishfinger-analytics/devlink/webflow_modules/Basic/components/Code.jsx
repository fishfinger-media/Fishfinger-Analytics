"use client";
import * as React from "react";
const Code = React.forwardRef(function Code(props, ref) {
  return React.createElement("code", { ...props, ref: ref });
});
export default Code;
