"use client";
import * as React from "react";
import { cj } from "../../utils";
const TabsContent = React.forwardRef(function TabsContent(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-tab-content"),
    ref,
  });
});
export default TabsContent;
