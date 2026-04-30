import { normalize } from "./normalize";
export const caseEquals =
  ({ text, caseSensitive }) =>
  (value) =>
    normalize(value, caseSensitive) === normalize(text, caseSensitive);
