import * as React from "react";
import { EASING_FUNCTIONS } from "../../utils";
import { Props } from "../../types";
type TabsWrapperProps = Props<
  "div",
  {
    current: string;
    easing: keyof typeof EASING_FUNCTIONS;
    fadeIn: number;
    fadeOut: number;
  }
>;
export type { TabsWrapperProps };
declare const TabsWrapper: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    current: string;
    easing: keyof typeof EASING_FUNCTIONS;
    fadeIn: number;
    fadeOut: number;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default TabsWrapper;
