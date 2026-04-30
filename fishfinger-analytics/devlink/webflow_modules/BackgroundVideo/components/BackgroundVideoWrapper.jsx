"use client";
import React from "react";
import { cj, debounce } from "../../utils";
import { BgVideoContext } from "../helpers/bgVideoContext";
const BackgroundVideoWrapper = React.forwardRef(function BackgroundVideoWrapper(
  {
    tag = "div",
    className = "",
    autoPlay = true,
    loop = true,
    sources = [],
    posterImage = "",
    children,
  },
  ref
) {
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const video = React.useRef(null);
  React.useImperativeHandle(ref, () => video.current);
  const togglePlay = debounce(() => {
    setIsPlaying(!isPlaying);
    if (!video?.current) return;
    if (video.current.paused) {
      video.current.play();
    } else {
      video.current.pause();
    }
  });
  return React.createElement(
    BgVideoContext.Provider,
    { value: { isPlaying, togglePlay } },
    React.createElement(
      tag,
      {
        className: cj(
          className,
          "w-background-video",
          "w-background-video-atom"
        ),
      },
      React.createElement(
        "video",
        {
          ref: video,
          autoPlay: autoPlay,
          loop: loop,
          style: posterImage
            ? { backgroundImage: `url("${posterImage}")` }
            : undefined,
          muted: true,
          playsInline: true,
        },
        sources.map((url) =>
          React.createElement("source", { src: url, key: url })
        )
      )
    ),
    children
  );
});
export default BackgroundVideoWrapper;
