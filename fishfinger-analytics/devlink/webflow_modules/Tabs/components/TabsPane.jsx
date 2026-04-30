"use client";
import * as React from "react";
import { cj } from "../../utils";
import { tabsContext } from "../helpers/tabsContext";
const TabsPane = React.forwardRef(function TabsPane(
  { tag = "div", className = "", ...props },
  ref
) {
  const { current } = React.useContext(tabsContext);
  const isCurrent = current === props["data-w-tab"];
  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-tab-pane", isCurrent && "w--tab-active"),
    role: "tabpanel",
    "aria-labelledby": props["data-w-tab"],
    ref,
  });
});
export default TabsPane;
