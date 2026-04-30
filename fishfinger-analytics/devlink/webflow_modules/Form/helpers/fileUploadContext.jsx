"use client";
import React from "react";
export const MAX_FILE_SIZE_DEFAULT = 10485760;
export const FileUploadContext = React.createContext({
  files: null,
  error: null,
  maxSize: MAX_FILE_SIZE_DEFAULT,
  setFiles: () => undefined,
  setError: () => undefined,
});
