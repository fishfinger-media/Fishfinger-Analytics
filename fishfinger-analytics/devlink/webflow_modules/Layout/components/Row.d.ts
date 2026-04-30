import * as React from "react";
import { ColumnProps } from "./Column";
declare const Row: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    children: React.ReactElement<ColumnProps>[];
    tag: React.ElementType;
    columns: {
      [key: string]: string;
    };
    value?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default Row;
