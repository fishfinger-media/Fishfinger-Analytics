import { caseDoesNotStartWith } from "../../Text/helpers/caseDoesNotStartWith";
import { toText } from "./toText";
export const textDoesNotStartWith = (config) => (value) =>
  caseDoesNotStartWith(config)(toText(value));
