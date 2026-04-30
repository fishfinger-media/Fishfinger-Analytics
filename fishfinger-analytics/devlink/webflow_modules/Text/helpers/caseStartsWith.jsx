import { normalize } from "./normalize";
export const caseStartsWith =
  ({ text, caseSensitive }) =>
  (value) =>
    normalize(value, caseSensitive).startsWith(normalize(text, caseSensitive));
