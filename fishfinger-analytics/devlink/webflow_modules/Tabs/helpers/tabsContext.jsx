"use client";
import * as React from "react";
export const tabsContext = React.createContext({
  current: "",
  onTabClick: () => undefined,
  onLinkKeyDown: () => undefined,
});
