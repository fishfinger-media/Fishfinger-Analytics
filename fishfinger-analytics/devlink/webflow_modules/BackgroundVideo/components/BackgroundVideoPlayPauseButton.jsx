"use client";
import React from "react";
import { cj } from "../../utils";
import { BgVideoContext } from "../helpers/bgVideoContext";
const BackgroundVideoPlayPauseButton = React.forwardRef(
  function BackgroundVideoPlayPauseButton({ children, className }, ref) {
    const { togglePlay } = React.useContext(BgVideoContext);
    return React.createElement(
      "div",
      { "aria-live": "polite" },
      React.createElement(
        "button",
        {
          type: "button",
          className: cj(
            className,
            "w-backgroundvideo-backgroundvideoplaypausebutton",
            "w-background-video--control"
          ),
          onClick: togglePlay,
          ref: ref,
        },
        children
      )
    );
  }
);
export default BackgroundVideoPlayPauseButton;
