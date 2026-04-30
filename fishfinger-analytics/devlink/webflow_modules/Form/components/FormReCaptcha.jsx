"use client";
import React from "react";
import { loadScript } from "../../utils";
const FormReCaptcha = React.forwardRef(function FormReCaptcha(
  { siteKey = "", theme = "light", size = "normal" },
  ref
) {
  React.useEffect(() => {
    loadScript("https://www.google.com/recaptcha/api.js", {
      cacheRegex: /(http|https):\/\/(www)?.+\/recaptcha/,
    });
  }, []);
  return React.createElement("div", {
    ref: ref,
    className: "g-recaptcha",
    "data-sitekey": siteKey,
    "data-theme": theme,
    "data-size": size,
  });
});
export default FormReCaptcha;
