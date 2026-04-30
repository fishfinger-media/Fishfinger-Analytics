"use client";
import * as React from "react";
import { cj } from "../../utils";
const CodeBlock = React.forwardRef(function CodeBlock(
  { code, language, theme, lineNumbers, className = "", ...props },
  ref
) {
  return React.createElement(
    "pre",
    {
      ...props,
      className: cj("w-code-block", className),
      ref: ref,
      style: { whiteSpace: "pre-wrap", ...props.style },
    },
    React.createElement(
      "code",
      {
        ...(language && { "data-language": language }),
        ...(theme && { "data-theme": theme }),
        ...(lineNumbers !== undefined && { "data-line-numbers": lineNumbers }),
      },
      code
    )
  );
});
export default CodeBlock;
