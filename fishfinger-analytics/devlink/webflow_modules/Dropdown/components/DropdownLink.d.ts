import * as React from "react";
import { LinkProps } from "../../Basic/components/Link";
type DropdownLinkProps = React.PropsWithChildren<{
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
}> &
  LinkProps;
export type { DropdownLinkProps };
declare const DropdownLink: React.ForwardRefExoticComponent<
  {
    tag?: keyof HTMLElementTagNameMap;
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & import("../../types").ElementProps<"a"> & {
      options?: {
        href: string;
        target?: "_self" | "_blank";
        preload?: "none" | "prefetch" | "prerender";
      };
      className?: string;
      button?: boolean;
      block?: string;
    } & React.RefAttributes<HTMLAnchorElement>
>;
export default DropdownLink;
