/**
 * Validates if a string is a valid ServiceNow sys_id (32-character hexadecimal)
 * @param input The string to validate
 * @returns boolean indicating if the input is a valid sys_id
 */
export function isValidSysId(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const sysId = input.trim().toLowerCase();
  if (sysId.length !== 32) return false;

  return /^[0-9a-f]{32}$/.test(sysId);
}
