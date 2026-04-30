import { isAny } from "./isAny";
export const isNotAny = (allowList) => {
  const predicate = isAny(allowList);
  return (value) => !predicate(value);
};
