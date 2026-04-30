"use client";
import * as React from "react";
const List = React.forwardRef(function List(
  { tag = "ul", unstyled = true, className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    role: "list",
    className: className + (unstyled ? " w-list-unstyled" : ""),
    ...props,
    ref,
  });
});
export default List;
