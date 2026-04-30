import * as React from "react";
declare const Heading: React.ForwardRefExoticComponent<
  {
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  } & {
    children?: React.ReactNode | undefined;
  } & React.HTMLAttributes<HTMLHeadingElement> &
    React.RefAttributes<HTMLHeadingElement>
>;
export default Heading;
