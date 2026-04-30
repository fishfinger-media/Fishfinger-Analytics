import React from "react";
type FormSelectProps = {
  options: Array<{
    v: string;
    t: string;
  }>;
};
declare const FormSelect: React.ForwardRefExoticComponent<
  React.SelectHTMLAttributes<HTMLSelectElement> &
    FormSelectProps &
    React.RefAttributes<unknown>
>;
export default FormSelect;
