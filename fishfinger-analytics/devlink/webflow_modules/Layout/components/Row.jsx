"use client";
import * as React from "react";
import Column from "./Column";
const transformWidths = (width, index) => {
  const widths = width?.split("|") ?? [];
  return widths.length > 1 ? widths[index] : width;
};
const columnClass = (width, key) => {
  if (/stack$/.test(width)) return "w-col-stack";
  if (/main$/.test(key)) return `w-col-${width}`;
  return `w-col-${key}-${width}`;
};
const Row = React.forwardRef(function Row(
  { tag = "div", className = "", columns, children, ...props },
  ref
) {
  return React.createElement(
    tag,
    { className: className + " w-row", ...props, ref },
    columns
      ? React.Children.map(children, (child, index) => {
          if (child && typeof child === "object" && child.type !== Column)
            return child;
          const columnClasses = Object.entries(columns ?? {}).reduce(
            (acc, [key, value]) => {
              const width = transformWidths(
                value === "custom" ? "6|6" : value,
                index
              );
              acc.add(width ? columnClass(width, key) : "");
              return acc;
            },
            new Set()
          );
          return React.cloneElement(child, {
            columnClasses: [...columnClasses].join(" "),
            ...child.props,
          });
        })
      : children
  );
});
export default Row;
