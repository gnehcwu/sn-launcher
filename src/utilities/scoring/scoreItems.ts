import type { CommandItem } from '@/types';
import { commandScore } from './score';
import { MIN_MATCH_LENGTH } from '../configs/constants';

/**
 * Scores menu items based on a given pattern.
 *
 * @param {Array} menuItems - The array of menu items to be scored.
 * @param {string} pattern - The pattern to be used for scoring.
 * @returns {Array} - The array of scored menu items.
 */
export default function scoreItems(menuItems: CommandItem[], pattern: string): CommandItem[] {
  if (!menuItems?.length) return [];
  if (!pattern || pattern.length < MIN_MATCH_LENGTH) return menuItems;

  const scoredItems = menuItems
    .map(item => ({
      ...item,
      score: commandScore(item.fullLabel, pattern)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredItems;
}