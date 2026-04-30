import { caseContains } from "./caseContains";
export const caseDoesNotContain = (config) => (value) =>
  !caseContains(config)(value);
