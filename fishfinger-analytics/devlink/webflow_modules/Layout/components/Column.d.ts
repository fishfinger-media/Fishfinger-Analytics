import * as React from "react";
import { Props } from "../../types";
type ColumnProps = Props<
  "div",
  {
    tag: React.ElementType;
    columnClasses?: string;
  }
>;
declare const Column: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    tag: React.ElementType;
    columnClasses?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export type { ColumnProps };
export default Column;
