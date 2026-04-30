import * as React from "react";
import { Props } from "../../types";
declare const CodeBlock: React.ForwardRefExoticComponent<
  Omit<Props<"pre">, "code" | "language" | "theme" | "lineNumbers"> & {
    code?: string;
    language?: string;
    theme?: string;
    lineNumbers?: boolean;
  } & React.RefAttributes<HTMLPreElement>
>;
export default CodeBlock;
