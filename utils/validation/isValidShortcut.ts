/**
 * Checks if a string matches valid shortcut patterns (.do or .list extensions)
 * @param input The string to validate
 * @returns boolean indicating if the input is a valid shortcut
 */
export function isValidShortcut(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const patterns = [/(.+)\.do$/, /(.+)\.list$/];
  return patterns.some((pattern) => pattern.test(input.trim()));
}
