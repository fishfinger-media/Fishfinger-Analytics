import * as React from "react";
declare const Iframe: React.ForwardRefExoticComponent<
  Omit<
    React.IframeHTMLAttributes<HTMLIFrameElement>,
    "allowFullScreen" | "frameBorder" | "scrolling"
  > & {
    allowFullScreen?: boolean | string;
    frameBorder?: number | string;
    scrolling?: string;
    iframe?: {
      type?: string;
    };
  } & React.RefAttributes<HTMLIFrameElement>
>;
export default Iframe;
