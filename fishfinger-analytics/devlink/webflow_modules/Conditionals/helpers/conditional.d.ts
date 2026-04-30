type Rule<T> = {
  condition: boolean;
  output: T;
};
export declare function conditional<T>({
  rules,
  fallback,
}: {
  rules: Rule<T>[];
  fallback: T;
}): T;
export {};
