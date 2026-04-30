import { caseContains } from "../../Text/helpers/caseContains";
import { toText } from "./toText";
export const textContains = (config) => (value) =>
  caseContains(config)(toText(value));
