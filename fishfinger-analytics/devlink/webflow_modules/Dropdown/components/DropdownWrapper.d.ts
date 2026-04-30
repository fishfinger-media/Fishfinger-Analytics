import * as React from "react";
type DropdownProps = React.PropsWithChildren<{
  tag?: keyof HTMLElementTagNameMap;
  className?: string;
}>;
type DropdownWrapperProps = DropdownProps & {
  delay: number;
  hover: boolean;
};
export type { DropdownWrapperProps };
declare const DropdownWrapper: React.ForwardRefExoticComponent<
  {
    tag?: keyof HTMLElementTagNameMap;
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & {
    delay: number;
    hover: boolean;
  } & React.RefAttributes<unknown>
>;
export default DropdownWrapper;
