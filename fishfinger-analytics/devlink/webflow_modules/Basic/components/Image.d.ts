import * as React from "react";
type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;
declare const Image: React.ForwardRefExoticComponent<
  Omit<ImageProps, "ref"> & React.RefAttributes<HTMLImageElement>
>;
export default Image;
