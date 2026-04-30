import * as React from "react";
type SliderSlideProps = React.PropsWithChildren<{
  style?: React.CSSProperties;
  tag?: string;
  className?: string;
  index?: number;
}>;
export type { SliderSlideProps };
declare const SliderSlide: React.ForwardRefExoticComponent<
  {
    style?: React.CSSProperties;
    tag?: string;
    className?: string;
    index?: number;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<unknown>
>;
export default SliderSlide;
