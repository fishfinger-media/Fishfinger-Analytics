"use client";
import * as React from "react";
import { cj } from "../../utils";
import { SliderContext } from "../helpers/sliderContext";
function useAutoplay() {
  const {
    autoplay,
    delay,
    autoMax,
    isAutoplayPaused,
    setAutoplayPause,
    goToNextSlide,
  } = React.useContext(SliderContext);
  const [autoMaxCount, setAutoMaxCount] = React.useState(0);
  const autoMaxReached = React.useMemo(
    () => autoMaxCount >= autoMax && autoMax > 0,
    [autoMax, autoMaxCount]
  );
  React.useEffect(() => {
    const shouldAutoplay = autoplay && !autoMaxReached && !isAutoplayPaused;
    if (shouldAutoplay) {
      const interval = setInterval(() => {
        setAutoMaxCount((prev) => prev + 1);
        goToNextSlide();
      }, delay);
      return () => clearInterval(interval);
    }
  }, [autoplay, delay, goToNextSlide, autoMaxReached, isAutoplayPaused]);
  const resumeAutoplay = () => setAutoplayPause(true);
  const pauseAutoplay = () => setAutoplayPause(false);
  return { resumeAutoplay, pauseAutoplay };
}
const SliderMask = React.forwardRef(function SliderMask(
  { className = "", children, ...props },
  ref
) {
  const { setSlideAmount } = React.useContext(SliderContext);
  const [isHovered, setHovered] = React.useState(false);
  const [slides, setSlides] = React.useState([]);
  const { resumeAutoplay, pauseAutoplay } = useAutoplay();
  React.useEffect(() => {
    const extractNonFragmentChildren = (_children) => {
      const childrenList = React.Children.toArray(_children).filter((child) =>
        React.isValidElement(child)
      );
      if (
        childrenList.length === 1 &&
        childrenList[0]?.type === React.Fragment
      ) {
        const fragmentProps = childrenList[0].props;
        return extractNonFragmentChildren(fragmentProps.children);
      } else {
        return childrenList;
      }
    };
    const _slides = extractNonFragmentChildren(children);
    setSlideAmount(_slides.length);
    setSlides(_slides);
  }, [children]);
  return React.createElement(
    "div",
    {
      ...props,
      className: cj(className, "w-slider-mask"),
      onMouseEnter: () => {
        pauseAutoplay();
        setHovered(true);
      },
      onMouseLeave: () => {
        resumeAutoplay();
        setHovered(false);
      },
      onFocus: () => pauseAutoplay(),
      onBlur: () => resumeAutoplay(),
      ref: ref,
    },
    slides.map((child, index) => {
      return React.cloneElement(child, {
        ...child.props,
        index,
      });
    }),
    React.createElement("div", {
      "aria-live": isHovered ? "polite" : "off",
      "aria-atomic": "true",
      className: "w-slider-aria-label",
    })
  );
});
export default SliderMask;
