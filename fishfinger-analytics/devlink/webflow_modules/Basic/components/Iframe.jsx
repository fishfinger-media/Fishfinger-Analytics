"use client";
import * as React from "react";
const Iframe = React.forwardRef(function Iframe(
  { title, allowFullScreen, frameBorder, scrolling, iframe: _iframe, ...props },
  ref
) {
  return React.createElement("iframe", {
    title: title,
    ...(allowFullScreen !== undefined && {
      allowFullScreen: allowFullScreen === "true" || allowFullScreen === true,
    }),
    ...(frameBorder !== undefined && {
      frameBorder:
        typeof frameBorder === "string"
          ? parseInt(frameBorder, 10) || 0
          : frameBorder,
    }),
    ...(scrolling && { scrolling }),
    ...props,
    ref: ref,
  });
});
export default Iframe;
