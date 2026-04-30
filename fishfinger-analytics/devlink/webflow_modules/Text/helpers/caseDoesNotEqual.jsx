import { caseEquals } from "./caseEquals";
export const caseDoesNotEqual = (config) => (value) =>
  !caseEquals(config)(value);
