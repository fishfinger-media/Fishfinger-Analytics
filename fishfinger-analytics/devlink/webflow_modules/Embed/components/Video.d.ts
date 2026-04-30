import React from "react";
import { Embed } from "../../types";
type VideoProps = {
  className?: string;
  options?: Embed.Video | null;
};
export type { VideoProps };
declare const Video: React.ForwardRefExoticComponent<
  VideoProps & React.RefAttributes<HTMLDivElement>
>;
export default Video;
