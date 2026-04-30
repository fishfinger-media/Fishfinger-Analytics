import { isSet } from "../../Text/helpers/isSet";
import { toText } from "./toText";
export const textIsSet = (value) => isSet(toText(value));
