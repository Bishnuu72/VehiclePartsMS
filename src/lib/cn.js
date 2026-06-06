// Tiny classNames combiner — no external deps.
// Accepts strings, arrays, and falsy values; flattens and joins.
export function cn(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim()
}
