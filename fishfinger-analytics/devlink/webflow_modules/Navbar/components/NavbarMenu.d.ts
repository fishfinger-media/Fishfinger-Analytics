import * as React from "react";
type NavbarMenuProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLElement> & {
    tag?: React.ElementType;
    isOpen?: boolean;
  }
>;
export type { NavbarMenuProps };
declare const NavbarMenu: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & {
    tag?: React.ElementType;
    isOpen?: boolean;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default NavbarMenu;
