import * as React from "react";
type TabsContentProps = {
  tag?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
};
export type { TabsContentProps };
declare const TabsContent: React.ForwardRefExoticComponent<
  TabsContentProps & React.RefAttributes<HTMLElement>
>;
export default TabsContent;
