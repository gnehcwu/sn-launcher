import { commandScore } from './score';
import { DEFAULT_RECORDS_SHOWN, MIN_MATCH_LENGTH } from '../configs/constants';

/**
 * Scores menu items based on a given pattern.
 *
 * @param {Array} menuItems - The array of menu items to be scored.
 * @param {string} pattern - The pattern to be used for scoring.
 * @returns {Array} - The array of scored menu items.
 */
export default function scoreItems(menuItems, pattern) {
  if (!menuItems) return [];

  if (!pattern || pattern.length < MIN_MATCH_LENGTH) {
    return menuItems.slice(0, DEFAULT_RECORDS_SHOWN);
  }

  const menusCopy = Array.from(menuItems, (item) => ({
    ...item,
    score: commandScore(item.fullLabel, pattern),
  }));
  const filteredMenus = menusCopy.filter((item) => item.score > 0);
  const sortedMenus = filteredMenus.sort((item1, item2) => item2.score - item1.score);

  return sortedMenus.slice(0, DEFAULT_RECORDS_SHOWN);
}
