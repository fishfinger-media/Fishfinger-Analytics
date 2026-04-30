export function conditional({ rules, fallback }) {
  for (const rule of rules) {
    if (rule.condition) return rule.output;
  }
  return fallback;
}
