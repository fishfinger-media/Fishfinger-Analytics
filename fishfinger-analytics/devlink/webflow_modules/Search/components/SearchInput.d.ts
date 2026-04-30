import React from "react";
declare const SearchInput: React.ForwardRefExoticComponent<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "form"> & {
    inputType?: string;
    customClassName?: string;
    form?:
      | string
      | {
          type?: string;
          name?: string;
        };
  } & React.RefAttributes<HTMLInputElement>
>;
export default SearchInput;
