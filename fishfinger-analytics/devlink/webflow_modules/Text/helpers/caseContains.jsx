import { normalize } from "./normalize";
export const caseContains =
  ({ text, caseSensitive }) =>
  (value) =>
    normalize(value, caseSensitive).includes(normalize(text, caseSensitive));
