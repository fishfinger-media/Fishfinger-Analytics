"use client";
import * as React from "react";
import { cj, debounce } from "../../utils";
import { SliderContext } from "../helpers/sliderContext";
function useSwipe({ onSwipeLeft, onSwipeRight, config }) {
  const SWIPE_DELTA = 150;
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    setTouchStart(touch.clientX);
  };
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    setTouchEnd(touch.clientX);
  };
  const handleTouchEnd = () => {
    if (config?.disableSwipe) return;
    if (touchStart - touchEnd > SWIPE_DELTA) {
      onSwipeLeft();
    }
    if (touchStart - touchEnd < -SWIPE_DELTA) {
      onSwipeRight();
    }
  };
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
const SliderWrapper = React.forwardRef(function SlideWrapper(
  { className = "", ...props },
  ref
) {
  const [slideAmount, setSlideAmount] = React.useState(0);
  const [selectedSlide, setSelectedSlide] = React.useState(0);
  const [prevSelectedSlide, setPrevSelectedSlide] = React.useState(0);
  const [isAutoplayPaused, setAutoplayPause] = React.useState(false);
  const setCurrentSlide = debounce((value) => {
    setSelectedSlide((prev) => {
      setPrevSelectedSlide(prev);
      return value;
    });
  });
  const goToNextSlide = debounce(() => {
    if (selectedSlide === slideAmount - 1) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(selectedSlide + 1);
    }
  });
  const goToPreviousSlide = debounce(() => {
    if (selectedSlide === 0) {
      setCurrentSlide(slideAmount - 1);
    } else {
      setCurrentSlide(selectedSlide - 1);
    }
  });
  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNextSlide,
    onSwipeRight: goToPreviousSlide,
  });
  return React.createElement(
    SliderContext.Provider,
    {
      value: {
        ...props,
        slideAmount,
        setSlideAmount,
        slide: { current: selectedSlide, previous: prevSelectedSlide },
        setCurrentSlide,
        goToNextSlide,
        goToPreviousSlide,
        isAutoplayPaused,
        setAutoplayPause,
      },
    },
    React.createElement(
      "div",
      {
        ...swipeHandlers,
        className: cj(className, "w-slider"),
        role: "region",
        "aria-label": "carousel",
        ref: ref,
      },
      props.children
    )
  );
});
export default SliderWrapper;
