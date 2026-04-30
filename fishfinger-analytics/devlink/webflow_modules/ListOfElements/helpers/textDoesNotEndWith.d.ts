import type { ReactNode } from "react";
export declare const textDoesNotEndWith: (config: {
  text: string;
  caseSensitive: boolean;
}) => (value: ReactNode | undefined) => boolean;
