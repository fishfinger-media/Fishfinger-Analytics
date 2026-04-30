"use client";
import React from "react";
import FormForm from "./FormForm";
import FormSuccessMessage from "./FormSuccessMessage";
import FormErrorMessage from "./FormErrorMessage";
const FormWrapper = React.forwardRef(function FormWrapper(
  {
    className = "",
    state: initialState = "normal",
    onSubmit,
    children,
    ...props
  },
  ref
) {
  const [state, setState] = React.useState(initialState);
  const formName =
    (children.find((c) => c.type === FormForm)?.props)["data-name"] ?? "Form";
  return React.createElement(
    "div",
    {
      className: className + " w-form",
      ...props,
      ref,
    },
    React.Children.map(children, (child) => {
      if (child.type === FormForm) {
        const style = {};
        if (state === "success") {
          style.display = "none";
        }
        return React.cloneElement(child, {
          ...child.props,
          style,
          onSubmit: async (e) => {
            try {
              e.preventDefault();
              if (window.grecaptcha && !window.grecaptcha?.getResponse()) {
                alert(`Please confirm you're not a robot.`);
                return;
              }
              if (onSubmit) {
                await onSubmit(e);
              }
              setState("success");
            } catch (err) {
              setState("error");
              throw err;
            }
          },
          "aria-label": formName,
        });
      }
      if (child.type === FormSuccessMessage) {
        const style = {};
        if (state === "success") {
          style.display = "block";
        }
        if (state === "error") {
          style.display = "none";
        }
        return React.cloneElement(child, {
          ...child.props,
          style,
          tabIndex: -1,
          role: "region",
          "aria-label": `${formName} success`,
        });
      }
      if (child.type === FormErrorMessage) {
        const style = {};
        if (state === "success") {
          style.display = "none";
        }
        if (state === "error") {
          style.display = "block";
        }
        return React.cloneElement(child, {
          ...child.props,
          tabIndex: -1,
          role: "region",
          "aria-label": `${formName} failure`,
          style,
        });
      }
      return child;
    })
  );
});
export default FormWrapper;
