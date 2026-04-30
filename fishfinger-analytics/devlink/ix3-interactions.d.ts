import * as React from "react";
type IX3Data = {
  interactions: any[];
  timelines: any[];
};
type IX3ContextValue = {
  registerIX3: ((data: IX3Data) => void) | null;
};
export declare const IX3Context: React.Context<IX3ContextValue>;
export declare const IX3Provider: React.FC<{
  children: React.ReactNode;
}>;
export declare const useIX3Interactions: (data: IX3Data) => void;
export {};
