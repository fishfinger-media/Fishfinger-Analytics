import * as React from "react";
import { LinkProps } from "../../Basic/components/Link";
type NavbarLinkProps = LinkProps;
export type { NavbarLinkProps };
declare const NavbarLink: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"a"> & {
    options?: {
      href: string;
      target?: "_self" | "_blank";
      preload?: "none" | "prefetch" | "prerender";
    };
    className?: string;
    button?: boolean;
    block?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLAnchorElement>
>;
export default NavbarLink;
