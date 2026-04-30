import * as React from "react";
declare const Cell: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<keyof HTMLElementTagNameMap> & {
    tag?: React.ElementType;
    grid?: unknown;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default Cell;
