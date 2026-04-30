"use client";
import * as React from "react";
import { cj, debounce, KEY_CODES } from "../../utils";
import { SliderContext } from "../helpers/sliderContext";
const SliderArrow = React.forwardRef(function SliderArrow(
  { className = "", dir = "left", children, ...props },
  ref
) {
  const {
    goToNextSlide,
    goToPreviousSlide,
    hideArrows,
    slideAmount,
    slide: { current },
  } = React.useContext(SliderContext);
  const handleSlideChange = debounce(() => {
    if (dir === "left") {
      goToPreviousSlide();
    } else {
      goToNextSlide();
    }
  });
  const isHidden = React.useMemo(() => {
    if (dir === "left" && hideArrows && current === 0) return true;
    if (dir === "right" && hideArrows && current === slideAmount - 1)
      return true;
    return false;
  }, [dir, hideArrows, current, slideAmount]);
  return React.createElement(
    "div",
    {
      ...props,
      onClick: handleSlideChange,
      onKeyDown: (e) => {
        e.stopPropagation();
        if (e.key === KEY_CODES.ENTER || e.key === KEY_CODES.SPACE) {
          e.preventDefault();
          handleSlideChange();
        }
      },
      role: "button",
      tabIndex: 0,
      className: cj(className, `w-slider-arrow-${dir}`),
      "aria-label": `${dir === "left" ? "previous" : "next"} slide`,
      style: { display: isHidden ? "none" : "block" },
      ref: ref,
    },
    children
  );
});
export default SliderArrow;
