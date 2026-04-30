import * as React from "react";
type SliderArrowProps = React.PropsWithChildren<{
  className?: string;
  dir: "left" | "right";
}>;
export type { SliderArrowProps };
declare const SliderArrow: React.ForwardRefExoticComponent<
  {
    className?: string;
    dir: "left" | "right";
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default SliderArrow;
