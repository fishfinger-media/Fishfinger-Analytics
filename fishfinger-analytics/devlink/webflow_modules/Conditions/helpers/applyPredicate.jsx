export function applyPredicate(value) {
  return (predicate) => predicate(value);
}
