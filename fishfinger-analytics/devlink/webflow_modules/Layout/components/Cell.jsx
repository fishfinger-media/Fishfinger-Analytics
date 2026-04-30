"use client";
import * as React from "react";
const Cell = React.forwardRef(function Cell(
  { tag = "div", className = "", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-cell",
    ...props,
    ref,
  });
});
export default Cell;
