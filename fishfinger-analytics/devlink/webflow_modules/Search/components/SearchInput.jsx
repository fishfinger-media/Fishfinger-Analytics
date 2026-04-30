"use client";
import React from "react";
import { onKeyDownInputHandlers } from "../../Form/helpers/formUtils";
const SearchInput = React.forwardRef(function SearchInput(
  { className = "", ...props },
  ref
) {
  return React.createElement("input", {
    ...props,
    type: "text",
    className: className + " w-input",
    onKeyDown: onKeyDownInputHandlers,
    ref,
  });
});
export default SearchInput;
