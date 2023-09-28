/**
 * Check whether passed string is an valid shortcut like {table}.list or {table}.do
 *
 * @param {string} str - string to check against
 * @returns - true/false flag of checking result
 */
export function isValidShortcut(str) {
  return [/(.+)\.do$/, /(.+)\.list$/].some((pattern) => pattern.test(str));
}

/**
 * Check whether passed string is a valid sys_id
 *
 * @param {string} strSysId  - record sys_id
 * @returns - true/false flag of checking result
 */
export function IsValidSysId(strSysId) {
  const sysId = strSysId.trim().toLowerCase();
  if (sysId.length != 32) return false;

  const regex = RegExp('([0-9a-f]){32}');
  return regex.test(sysId);
}

/**
 *  Check compact ui mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of checking result
 */
export function isCompactMode(commandMode) {
  return commandMode && !['switch_app', 'actions'].includes(commandMode);
}

/**
 * Check actions mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of showing all action modes
 */
export function isActionsMode(commandMode) {
  return commandMode && commandMode === 'actions';
}

/**
 *Check switching application scope mode based on command mode
 *
 * @param {string} commandMode - command mode
 * @returns - true/false flag of switching application scope
 */
export function isSwitchAppMode(commandMode) {
  return commandMode && commandMode === 'switch_app';
}
