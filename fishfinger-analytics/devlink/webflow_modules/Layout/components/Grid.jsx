"use client";
import * as React from "react";
const Grid = React.forwardRef(function Grid(
  { tag = "div", className = "", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-grid",
    ...props,
    ref,
  });
});
export default Grid;
