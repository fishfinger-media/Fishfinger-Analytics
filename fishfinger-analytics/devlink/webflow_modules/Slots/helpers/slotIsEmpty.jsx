export const slotIsEmpty = (value) =>
  value == null || value === "" || (Array.isArray(value) && value.length === 0);
