import { caseStartsWith } from "../../Text/helpers/caseStartsWith";
import { toText } from "./toText";
export const textStartsWith = (config) => (value) =>
  caseStartsWith(config)(toText(value));
