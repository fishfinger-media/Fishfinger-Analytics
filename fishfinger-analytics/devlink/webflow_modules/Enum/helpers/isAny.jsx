export const isAny = (allowList) => (value) =>
  value != null && allowList.includes(value);
