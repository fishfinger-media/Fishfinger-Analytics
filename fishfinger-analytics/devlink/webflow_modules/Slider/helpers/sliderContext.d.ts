import * as React from "react";
import { EASING_FUNCTIONS } from "../../utils";
export type SliderConfig = {
  navSpacing: number;
  navShadow: boolean;
  autoplay: boolean;
  delay: number;
  iconArrows: boolean;
  animation: "slide" | "cross" | "outin" | "fade" | "over";
  navNumbers: boolean;
  easing: keyof typeof EASING_FUNCTIONS;
  navRound: boolean;
  hideArrows: boolean;
  disableSwipe: boolean;
  duration: number;
  infinite: boolean;
  autoMax: number;
  navInvert: boolean;
};
export type SlideState = {
  current: number;
  previous: number;
};
export declare const DEFAULT_SLIDER_CONFIG: SliderConfig;
export declare const SliderContext: React.Context<
  SliderConfig & {
    slideAmount: number;
    setSlideAmount: React.Dispatch<React.SetStateAction<number>>;
    slide: SlideState;
    setCurrentSlide: (current: number) => void;
    goToNextSlide: () => void;
    goToPreviousSlide: () => void;
    isAutoplayPaused: boolean;
    setAutoplayPause: React.Dispatch<React.SetStateAction<boolean>>;
  }
>;
