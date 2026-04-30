export const videoIsSet = (video) =>
  video != null && Boolean(video.url?.trim());
