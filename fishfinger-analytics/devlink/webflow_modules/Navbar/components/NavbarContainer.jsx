"use client";
import * as React from "react";
import { useResizeObserver } from "../../utils";
import Container from "../../Layout/components/Container";
import { NavbarContext } from "../helpers/navbarContext";
const NavbarContainer = React.forwardRef(function NavbarContainer(
  { children, ...props },
  ref
) {
  const innerRef = React.useRef(null);
  const { isOpen } = React.useContext(NavbarContext);
  React.useImperativeHandle(ref, () => innerRef.current);
  const updateLinkStyles = React.useCallback(
    (entry) => {
      const { maxWidth: containerMaxWidth } = getComputedStyle(entry.target);
      document
        .querySelectorAll(".w-nav-menu>.w-dropdown,.w-nav-menu>.w-nav-link")
        .forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (!isOpen) {
            node.style.maxWidth = "";
            return;
          }
          const { maxWidth } = getComputedStyle(node);
          node.style.maxWidth =
            !maxWidth || maxWidth === "none" || maxWidth === containerMaxWidth
              ? containerMaxWidth
              : "";
        });
    },
    [isOpen]
  );
  useResizeObserver(innerRef, updateLinkStyles);
  return React.createElement(Container, { ...props, ref: innerRef }, children);
});
export default NavbarContainer;
