import * as React from "react";
import { TagProps } from "../../types";
type NavbarContainerProps = TagProps & {
  toggleOpen?: () => void;
  isOpen?: boolean;
  children: React.ReactNode;
};
export type { NavbarContainerProps };
declare const NavbarContainer: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<keyof HTMLElementTagNameMap> & {
    tag?: React.ElementType;
    grid?: unknown;
  } & {
    children?: React.ReactNode | undefined;
  } & {
    toggleOpen?: () => void;
    isOpen?: boolean;
    children: React.ReactNode;
  } & React.RefAttributes<HTMLElement>
>;
export default NavbarContainer;
