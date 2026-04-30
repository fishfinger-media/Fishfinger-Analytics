import React from "react";
type FormReCaptchaProps = {
  siteKey?: string;
  theme?: "light" | "dark";
  size?: "compact" | "normal" | "invisible";
};
declare const FormReCaptcha: React.ForwardRefExoticComponent<
  FormReCaptchaProps & React.RefAttributes<HTMLDivElement>
>;
export default FormReCaptcha;
