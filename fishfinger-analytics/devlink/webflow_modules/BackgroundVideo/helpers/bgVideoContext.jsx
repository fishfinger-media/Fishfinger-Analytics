"use client";
import React from "react";
export const BgVideoContext = React.createContext({
  isPlaying: true,
  togglePlay: () => undefined,
});
