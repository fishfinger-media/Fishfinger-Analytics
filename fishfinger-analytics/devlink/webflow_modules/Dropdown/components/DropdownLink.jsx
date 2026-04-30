"use client";
import * as React from "react";
import { cj } from "../../utils";
import { NavbarContext } from "../../Navbar/helpers/navbarContext";
import Link from "../../Basic/components/Link";
const DropdownLink = React.forwardRef(function DropdownLink(
  { className = "", ...props },
  ref
) {
  const { isOpen: isNavbarOpen } = React.useContext(NavbarContext);
  return React.createElement(Link, {
    ...props,
    className: cj(
      className,
      "w-dropdown-link",
      isNavbarOpen && "w--nav-link-open"
    ),
    tabIndex: 0,
    ref,
  });
});
export default DropdownLink;
