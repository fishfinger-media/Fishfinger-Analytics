import { isNotSet } from "../../Text/helpers/isNotSet";
import { toText } from "./toText";
export const textIsNotSet = (value) => isNotSet(toText(value));
