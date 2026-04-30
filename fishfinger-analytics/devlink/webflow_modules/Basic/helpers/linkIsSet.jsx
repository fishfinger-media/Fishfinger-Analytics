export const linkIsSet = (link) =>
  link != null && Boolean(link.href?.trim()) && link.href.trim() !== "#";
