"use client";
import * as React from "react";
const VFlex = React.forwardRef(function VFlex(
  { tag = "div", className = "", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-vflex",
    ...props,
    ref,
  });
});
export default VFlex;
