import * as React from "react";
type SliderMaskProps = React.PropsWithChildren<{
  className?: string;
}>;
export type { SliderMaskProps };
declare const SliderMask: React.ForwardRefExoticComponent<
  {
    className?: string;
  } & {
    children?: React.ReactNode | undefined;
  } & React.RefAttributes<HTMLDivElement>
>;
export default SliderMask;
