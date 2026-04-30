import * as React from "react";
export declare const DropdownContext: React.Context<{
  root: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  toggleOpen: () => void;
  setFocusedLink: React.Dispatch<React.SetStateAction<number>>;
  hover: boolean;
}>;
