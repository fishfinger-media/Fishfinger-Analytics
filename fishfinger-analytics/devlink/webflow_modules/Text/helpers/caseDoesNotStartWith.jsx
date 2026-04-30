import { caseStartsWith } from "./caseStartsWith";
export const caseDoesNotStartWith = (config) => (value) =>
  !caseStartsWith(config)(value);
