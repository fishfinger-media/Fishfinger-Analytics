import * as React from "react";
declare const HtmlEmbed: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    tag?: React.ElementType;
    value: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLElement>
>;
export default HtmlEmbed;
