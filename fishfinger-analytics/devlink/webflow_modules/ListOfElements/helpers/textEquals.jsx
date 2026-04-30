import { caseEquals } from "../../Text/helpers/caseEquals";
import { toText } from "./toText";
export const textEquals = (config) => (value) =>
  caseEquals(config)(toText(value));
