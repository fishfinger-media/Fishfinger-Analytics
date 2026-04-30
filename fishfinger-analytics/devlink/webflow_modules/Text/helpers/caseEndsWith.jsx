import { normalize } from "./normalize";
export const caseEndsWith =
  ({ text, caseSensitive }) =>
  (value) =>
    normalize(value, caseSensitive).endsWith(normalize(text, caseSensitive));
