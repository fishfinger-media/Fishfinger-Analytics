"use client";
import * as React from "react";
const Section = React.forwardRef(function Section(
  { tag = "section", grid: _grid, ...props },
  ref
) {
  return React.createElement(tag, {
    ...props,
    ref,
  });
});
export default Section;
