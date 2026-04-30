import * as React from "react";
import { LinkProps } from "../../types";
export type { LinkProps };
declare const Link: React.ForwardRefExoticComponent<
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
export default Link;
