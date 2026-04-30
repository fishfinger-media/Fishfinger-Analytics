import * as React from "react";
export declare const tabsContext: React.Context<{
  current: string;
  onTabClick: (next: string) => void;
  onLinkKeyDown: React.KeyboardEventHandler<HTMLAnchorElement>;
}>;
