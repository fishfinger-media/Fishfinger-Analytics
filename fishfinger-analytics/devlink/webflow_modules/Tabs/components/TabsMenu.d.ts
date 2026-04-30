import * as React from "react";
type TabsMenuProps = {
  tag?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
};
export type { TabsMenuProps };
declare const TabsMenu: React.ForwardRefExoticComponent<
  TabsMenuProps & React.RefAttributes<HTMLElement>
>;
export default TabsMenu;
