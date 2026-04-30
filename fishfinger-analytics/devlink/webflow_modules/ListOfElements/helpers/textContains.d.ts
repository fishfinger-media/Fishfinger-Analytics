import type { ReactNode } from "react";
export declare const textContains: (config: {
  text: string;
  caseSensitive: boolean;
}) => (value: ReactNode | undefined) => boolean;
