import { styleVariantIsAny } from "./styleVariantIsAny";
export const styleVariantIsNotAny = (allowList) => {
  const predicate = styleVariantIsAny(allowList);
  return (value) => !predicate(value);
};
