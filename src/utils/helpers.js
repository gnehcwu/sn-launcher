/**
 * Check whether passed string is an valid shortcut like {table}.list or {table}.do
 *
 * @param {string} str - string to check against
 * @returns true/false flag of checking result
 */
export function isValidShortcut(str) {
  return [/(.+)\.do$/, /(.+)\.list$/].some((pattern) => pattern.test(str));
}
