import * as React from "react";
import { EASING_FUNCTIONS } from "../../utils";
declare const BREAKPOINTS: {
  medium: number;
  small: number;
  tiny: number;
};
export { BREAKPOINTS };
export type NavbarConfig = {
  animation: string;
  collapse: keyof typeof BREAKPOINTS;
  docHeight: boolean;
  duration: number;
  easing: keyof typeof EASING_FUNCTIONS;
  easing2: keyof typeof EASING_FUNCTIONS;
  noScroll: boolean;
};
export declare const NavbarContext: React.Context<
  NavbarConfig & {
    animDirect: -1 | 1;
    animOver: boolean;
    getBodyHeight: () => number | void;
    getOverlayHeight: () => number | undefined;
    isOpen: boolean;
    menu: React.MutableRefObject<HTMLElement | null>;
    root: React.MutableRefObject<HTMLElement | null>;
    toggleOpen: () => void;
    navbarMounted: boolean;
    setFocusedLink: React.Dispatch<React.SetStateAction<number>>;
  }
>;
