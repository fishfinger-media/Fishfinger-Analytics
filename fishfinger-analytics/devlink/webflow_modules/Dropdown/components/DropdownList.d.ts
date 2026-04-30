import * as React from "react";
type DropdownListProps = React.PropsWithChildren<{
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
}>;
export type { DropdownListProps };
declare const DropdownList: React.ForwardRefExoticComponent<
  {
    tag?: keyof HTMLElementTagNameMap;
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<unknown>
>;
export default DropdownList;
