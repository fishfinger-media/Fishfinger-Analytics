import * as React from "react";
declare const Figure: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"figure"> & {
    children?: React.ReactNode | undefined;
  } & {
    figure?: {
      align?: string;
      type?: string;
      url?: string;
      width?: number;
      height?: number;
      dimensions?: string;
      maxHeight?: string;
      maxWidth?: string;
      pageUrl?: string;
    };
  } & React.RefAttributes<HTMLElement>
>;
export default Figure;
