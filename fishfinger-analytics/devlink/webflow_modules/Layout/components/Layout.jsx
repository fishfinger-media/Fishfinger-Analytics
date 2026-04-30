"use client";
import * as React from "react";
const Layout = React.forwardRef(function Layout(
  { tag = "div", className = "", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-layout-layout wf-layout-layout",
    ...props,
    ref,
  });
});
export default Layout;
