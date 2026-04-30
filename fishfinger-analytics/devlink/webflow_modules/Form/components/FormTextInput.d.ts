import React from "react";
type FormInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "form"
> & {
  inputType?: string;
  customClassName?: string;
  form?:
    | string
    | {
        type?: string;
        name?: string;
      };
};
export type { FormInputProps };
declare const FormTextInput: React.ForwardRefExoticComponent<
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
export default FormTextInput;
