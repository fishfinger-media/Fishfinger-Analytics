import React from "react";
import FormForm from "./FormForm";
import FormSuccessMessage from "./FormSuccessMessage";
import FormErrorMessage from "./FormErrorMessage";
declare global {
  interface Window {
    grecaptcha: any;
  }
}
type FormState = "normal" | "success" | "error";
declare const FormWrapper: React.ForwardRefExoticComponent<
  import("../../types").ElementProps<"div"> & {
    children?: React.ReactNode | undefined;
  } & {
    state?: FormState;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    children: React.ReactElement<
      typeof FormForm | typeof FormSuccessMessage | typeof FormErrorMessage
    >[];
  } & React.RefAttributes<unknown>
>;
export default FormWrapper;
