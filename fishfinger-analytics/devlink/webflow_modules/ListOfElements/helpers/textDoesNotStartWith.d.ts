import type { ReactNode } from "react";
export declare const textDoesNotStartWith: (config: {
  text: string;
  caseSensitive: boolean;
}) => (value: ReactNode | undefined) => boolean;
