"use client";
import React from "react";
const SearchForm = React.forwardRef(function SearchForm(props, ref) {
  return React.createElement("form", { ...props, ref });
});
export default SearchForm;
