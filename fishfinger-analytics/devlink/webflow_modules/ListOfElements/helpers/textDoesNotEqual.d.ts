import type { ReactNode } from "react";
export declare const textDoesNotEqual: (config: {
  text: string;
  caseSensitive: boolean;
}) => (value: ReactNode | undefined) => boolean;
