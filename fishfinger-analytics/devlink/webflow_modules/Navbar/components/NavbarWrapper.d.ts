import * as React from "react";
import { NavbarConfig } from "../helpers/navbarContext";
type NavbarProps = {
  tag: React.ElementType;
  config: NavbarConfig;
  className?: string;
  children?: React.ReactNode;
};
export type { NavbarProps };
declare const NavbarWrapper: React.ForwardRefExoticComponent<
  NavbarProps & React.RefAttributes<HTMLElement>
>;
export default NavbarWrapper;
