"use client";
import * as React from "react";
import { cj } from "../../utils";
const TabsMenu = React.forwardRef(function TabsMenu(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-tab-menu"),
    role: "tablist",
    ref,
  });
});
export default TabsMenu;
