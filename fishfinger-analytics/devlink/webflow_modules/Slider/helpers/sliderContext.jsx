"use client";
import * as React from "react";
export const DEFAULT_SLIDER_CONFIG = {
  navSpacing: 3,
  navShadow: false,
  autoplay: false,
  delay: 4000,
  iconArrows: true,
  animation: "slide",
  navNumbers: true,
  easing: "ease",
  navRound: true,
  hideArrows: false,
  disableSwipe: false,
  duration: 500,
  infinite: true,
  autoMax: 0,
  navInvert: false,
};
export const SliderContext = React.createContext({
  ...DEFAULT_SLIDER_CONFIG,
  slideAmount: 0,
  setSlideAmount: () => undefined,
  setCurrentSlide: () => undefined,
  goToNextSlide: () => undefined,
  goToPreviousSlide: () => undefined,
  slide: { current: 0, previous: 0 },
  isAutoplayPaused: false,
  setAutoplayPause: () => undefined,
});
