import * as React from "react";
type NavbarButtonProps = React.PropsWithChildren<{
  tag?: React.ElementType;
  className?: string;
}>;
export type { NavbarButtonProps };
declare const NavbarButton: React.ForwardRefExoticComponent<
  {
    tag?: React.ElementType;
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default NavbarButton;
