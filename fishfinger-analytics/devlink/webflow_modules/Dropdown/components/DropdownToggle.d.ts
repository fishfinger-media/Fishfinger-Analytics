import * as React from "react";
type DropdownToggleProps = React.PropsWithChildren<{
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
}>;
export type { DropdownToggleProps };
declare const DropdownToggle: React.ForwardRefExoticComponent<
  {
    tag?: keyof HTMLElementTagNameMap;
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<unknown>
>;
export default DropdownToggle;
