function clamp(lower, upper, n) {
  return Math.min(Math.max(lower, n), upper);
}
function clampPrecisionArg(precision) {
  return clamp(0, 8, precision);
}
export const formatNumber = (decimals) => (num) => {
  if (typeof num !== "number" || typeof decimals !== "number" || decimals < 0) {
    return String(num);
  }
  return num.toFixed(clampPrecisionArg(Math.floor(decimals)));
};
