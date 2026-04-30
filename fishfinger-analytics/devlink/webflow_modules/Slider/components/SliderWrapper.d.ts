import * as React from "react";
import { SliderConfig } from "../helpers/sliderContext";
type SliderWrapperProps = SliderConfig & {
  className?: string;
  children?: React.ReactNode;
};
export type { SliderWrapperProps };
declare const SliderWrapper: React.ForwardRefExoticComponent<
  SliderConfig & {
    className?: string;
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLDivElement>
>;
export default SliderWrapper;
