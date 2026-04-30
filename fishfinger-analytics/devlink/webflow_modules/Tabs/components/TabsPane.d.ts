import * as React from "react";
type TabsPaneProps = React.PropsWithChildren<{
  tag?: React.ElementType;
  className?: string;
  "data-w-tab": string;
}>;
export type { TabsPaneProps };
declare const TabsPane: React.ForwardRefExoticComponent<
  {
    tag?: React.ElementType;
    className?: string;
    "data-w-tab": string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default TabsPane;
