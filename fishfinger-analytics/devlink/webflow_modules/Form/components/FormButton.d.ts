import React from "react";
declare const FormButton: React.ForwardRefExoticComponent<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "form"> & {
    inputType?: string;
    customClassName?: string;
    form?:
      | string
      | {
          type?: string;
          name?: string;
        };
  } & React.RefAttributes<unknown>
>;
export default FormButton;
