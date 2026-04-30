"use client";
import * as React from "react";
const BlockContainer = React.forwardRef(function BlockContainer(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-blockcontainer",
    ...props,
    ref,
  });
});
export default BlockContainer;
