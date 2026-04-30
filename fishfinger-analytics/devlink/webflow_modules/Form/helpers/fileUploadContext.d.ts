import React from "react";
export declare const MAX_FILE_SIZE_DEFAULT = 10485760;
export type FileUploadErrors = {
  SIZE_ERROR: string;
  TYPE_ERROR: string;
  GENERIC_ERROR: string;
};
export type FileUploadError = keyof FileUploadErrors;
export type FileUploadContextType = {
  files: FileList | null;
  error: FileUploadError | null;
  maxSize: number;
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
  setError: React.Dispatch<React.SetStateAction<FileUploadError | null>>;
};
export declare const FileUploadContext: React.Context<FileUploadContextType>;
