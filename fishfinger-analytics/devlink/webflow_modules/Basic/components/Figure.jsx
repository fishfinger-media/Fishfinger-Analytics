"use client";
import * as React from "react";
const Figure = React.forwardRef(function Figure(
  { className = "", figure, ...props },
  ref
) {
  const { type, align } = figure ?? {};
  if (align) {
    className += `w-richtext-align-${align} `;
  }
  if (type) {
    className += `w-richtext-align-${type} `;
  }
  return React.createElement("figure", {
    className: className,
    ...props,
    ref: ref,
  });
});
export default Figure;
