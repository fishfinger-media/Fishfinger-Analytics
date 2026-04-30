import * as React from "react";
declare const Icon: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    widget: {
      icon: string;
      type?: string;
    };
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default Icon;
