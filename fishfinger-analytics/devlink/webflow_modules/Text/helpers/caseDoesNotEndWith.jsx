import { caseEndsWith } from "./caseEndsWith";
export const caseDoesNotEndWith = (config) => (value) =>
  !caseEndsWith(config)(value);
