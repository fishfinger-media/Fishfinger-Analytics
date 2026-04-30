"use client";
import * as React from "react";
const Paragraph = React.forwardRef(function Paragraph(props, ref) {
  return React.createElement("p", {
    ...props,
    ref,
  });
});
export default Paragraph;
