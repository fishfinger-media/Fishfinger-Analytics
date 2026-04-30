export const styleVariantIsAny = (allowList) => (value) =>
  value != null && allowList.includes(value);
