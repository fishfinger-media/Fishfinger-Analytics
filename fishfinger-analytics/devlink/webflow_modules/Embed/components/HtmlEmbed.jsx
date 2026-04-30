"use client";
import * as React from "react";
import * as utils from "../../utils";
const HtmlEmbed = React.forwardRef(function HtmlEmbed(
  { tag = "div", className = "", value = "", ...props },
  ref
) {
  return React.createElement(tag, {
    className: className + " w-embed",
    dangerouslySetInnerHTML: { __html: utils.removeUnescaped(value) },
    ...props,
    ref,
  });
});
export default HtmlEmbed;
