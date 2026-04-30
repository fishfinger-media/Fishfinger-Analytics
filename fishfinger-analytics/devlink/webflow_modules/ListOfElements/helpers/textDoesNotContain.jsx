import { caseDoesNotContain } from "../../Text/helpers/caseDoesNotContain";
import { toText } from "./toText";
export const textDoesNotContain = (config) => (value) =>
  caseDoesNotContain(config)(toText(value));
