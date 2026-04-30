"use client";
import * as React from "react";
import { cj } from "../../utils";
import Link from "../../Basic/components/Link";
import { NavbarContext } from "../helpers/navbarContext";
const NavbarLink = React.forwardRef(function NavbarLink(
  { className = "", ...props },
  ref
) {
  const { isOpen } = React.useContext(NavbarContext);
  return React.createElement(Link, {
    ...props,
    className: cj(className, "w-nav-link", isOpen && "w--nav-link-open"),
    ref: ref,
  });
});
export default NavbarLink;
