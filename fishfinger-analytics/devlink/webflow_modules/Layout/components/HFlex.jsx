"use client";
import * as React from "react";
const HFlex = React.forwardRef(function HFlex(
  { tag = "div", className = "", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-hflex",
    ...props,
    ref,
  });
});
export default HFlex;
