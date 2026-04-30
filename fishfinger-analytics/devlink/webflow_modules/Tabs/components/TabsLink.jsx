"use client";
import * as React from "react";
import { triggerIXEvent } from "../../interactions";
import { cj } from "../../utils";
import { tabsContext } from "../helpers/tabsContext";
const TabsLink = React.forwardRef(function TabsLink(
  { className = "", children, ...props },
  ref
) {
  const { current, onTabClick, onLinkKeyDown } = React.useContext(tabsContext);
  const isCurrent = current === props["data-w-tab"];
  const innerRef = React.useCallback(
    (node) => {
      if (!node) return;
      triggerIXEvent(node, isCurrent);
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [isCurrent, ref]
  );
  return React.createElement(
    "a",
    {
      ...props,
      ref: innerRef,
      className: cj(
        className,
        "w-inline-block w-tab-link",
        isCurrent && "w--current"
      ),
      onClick: () => onTabClick(props["data-w-tab"]),
      onKeyDown: onLinkKeyDown,
      role: "tab",
      tabIndex: isCurrent ? 0 : -1,
      "aria-selected": isCurrent,
      "aria-controls": props["data-w-tab"],
    },
    children
  );
});
export default TabsLink;
