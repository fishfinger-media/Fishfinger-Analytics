"use client";
import * as React from "react";
import { IXContext, triggerIXEvent } from "../../interactions";
import { EASING_FUNCTIONS, cj } from "../../utils";
import { SliderContext } from "../helpers/sliderContext";
const SliderSlide = React.forwardRef(function SliderSlide(
  { tag = "div", className = "", style = {}, index = 0, ...props },
  ref
) {
  const {
    animation,
    duration,
    easing,
    slide: { current, previous },
    slideAmount,
  } = React.useContext(SliderContext);
  const { restartEngine } = React.useContext(IXContext);
  React.useEffect(() => {
    restartEngine && restartEngine();
  }, [restartEngine]);
  const isSlideActive = current === index;
  const isSlidePrevious = previous === index;
  const animationStyle = React.useMemo(() => {
    const base = {
      transform: `translateX(-${current * 100}%)`,
      transition: `transform ${duration}ms ${EASING_FUNCTIONS[easing]} 0s`,
    };
    if (animation === "slide") {
      return base;
    }
    if (animation === "cross") {
      return {
        ...base,
        opacity: isSlideActive ? 1 : 0,
        transition: `opacity ${duration}ms ${
          EASING_FUNCTIONS[easing]
        } 0s, transform 1ms linear ${isSlideActive ? 0 : duration}ms`,
      };
    }
    if (animation === "outin") {
      return {
        ...base,
        opacity: isSlideActive ? 1 : 0,
        transition: `opacity ${duration / 2}ms ${EASING_FUNCTIONS[easing]} ${
          isSlidePrevious ? 0 : duration / 2
        }ms, transform 1ms linear ${isSlidePrevious ? duration / 2 : 0}ms`,
      };
    }
    if (animation === "fade") {
      return {
        ...base,
        opacity: isSlideActive ? 1 : 0,
        transition: `opacity ${duration}ms ${
          EASING_FUNCTIONS[easing]
        } 0s, transform 1ms linear ${isSlideActive ? 0 : duration}ms`,
      };
    }
    if (animation === "over") {
      return {
        ...base,
        transition: `transform ${duration}ms ${EASING_FUNCTIONS[easing]} ${
          isSlidePrevious ? duration : 0
        }ms`,
        zIndex: isSlideActive ? 1 : 0,
      };
    }
    return base;
  }, [animation, duration, easing, current, isSlideActive, isSlidePrevious]);
  const innerRef = React.useCallback(
    (node) => {
      triggerIXEvent(node, isSlideActive);
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [isSlideActive, ref]
  );
  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-slide"),
    style: { ...style, ...animationStyle },
    "aria-label": `${index + 1} of ${slideAmount}`,
    role: "group",
    ref: innerRef,
    "aria-hidden": !isSlideActive ? "true" : "false",
  });
});
export default SliderSlide;
