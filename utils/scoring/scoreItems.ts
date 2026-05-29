import type { CommandItem } from '@/utils/types';
import { commandScore } from './score';
import { MIN_MATCH_LENGTH } from '../configs/constants';

/**
 * Scores menu items based on a given pattern.
 *
 * @param {Array} menuItems - The array of menu items to be scored.
 * @param {string} pattern - The pattern to be used for scoring.
 * @param {number} minScore - Drop matches at or below this score. Defaults to 0
 *   (keep any subsequence match — the permissive fuzzy behavior). Callers that
 *   need a quality floor (eg. Impersonate, to avoid loose junk) can raise it.
 * @returns {Array} - The array of scored menu items.
 */
export default function scoreItems(
  menuItems: CommandItem[],
  pattern: string,
  minScore = 0
): CommandItem[] {
  if (!menuItems?.length) return [];
  if (!pattern || pattern.length < MIN_MATCH_LENGTH) return menuItems;

  const scoredItems = menuItems
    .map(item => ({
      ...item,
      score: commandScore(item.fullLabel, pattern)
    }))
    .filter(item => item.score > minScore)
    .sort((a, b) => b.score - a.score);

  return scoredItems;
}