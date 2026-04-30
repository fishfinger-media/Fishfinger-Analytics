"use client";
import * as React from "react";
const ListItem = React.forwardRef(function ListItem(props, ref) {
  return React.createElement("li", {
    ...props,
    ref,
  });
});
export default ListItem;
