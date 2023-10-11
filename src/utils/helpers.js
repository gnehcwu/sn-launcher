/**
 * Checks if a string is a valid Google Sheets shortcut.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - Returns true if the string is a valid Google Sheets shortcut, false otherwise.
 */
export function isValidShortcut(str) {
  return [/(.+)\.do$/, /(.+)\.list$/].some((pattern) => pattern.test(str));
}

/**
 * Checks if a given string is a valid system ID.
 * @param {string} strSysId - The string to check.
 * @returns {boolean} - True if the string is a valid system ID, false otherwise.
 */
export function IsValidSysId(strSysId) {
  const sysId = strSysId.trim().toLowerCase();
  if (sysId.length !== 32) return false;

  const regex = RegExp('([0-9a-f]){32}');
  return regex.test(sysId);
}
