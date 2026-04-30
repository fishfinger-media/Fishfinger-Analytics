import * as React from "react";
type TwitterSize = "m" | "l";
type TwitterMode = "follow" | "tweet";
type TwitterProps = React.PropsWithChildren<{
  className?: string;
  mode?: TwitterMode;
  url?: string;
  text?: string;
  size?: TwitterSize;
}>;
declare global {
  interface Window {
    twttr: any;
  }
}
export type { TwitterProps, TwitterSize, TwitterMode };
declare const Twitter: React.ForwardRefExoticComponent<
  {
    className?: string;
    mode?: TwitterMode;
    url?: string;
    text?: string;
    size?: TwitterSize;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default Twitter;
