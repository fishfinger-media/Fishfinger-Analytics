"use client";
import * as React from "react";
const Strong = React.forwardRef(function Strong(props, ref) {
  return React.createElement("strong", {
    ...props,
    ref,
  });
});
export default Strong;
