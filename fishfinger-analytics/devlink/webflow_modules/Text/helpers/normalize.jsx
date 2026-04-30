export const normalize = (text, caseSensitive) =>
  caseSensitive ? text ?? "" : (text ?? "").toLowerCase();
