import * as React from "react";
type FacebookProps = React.PropsWithChildren<{
  className?: string;
  layout?: string;
  width?: number;
  height?: number;
  url?: string;
  locale?: string;
}>;
export type { FacebookProps };
declare const Facebook: React.ForwardRefExoticComponent<
  {
    className?: string;
    layout?: string;
    width?: number;
    height?: number;
    url?: string;
    locale?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default Facebook;
