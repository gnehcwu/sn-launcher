import { commandScore } from './score';
import { DEFAULT_RECORDS_SHOWN, MIN_MATCH_LENGTH } from '../configs/constants';

export default function scoreItems(menuItems, pattern) {
  if (!menuItems) return [];

  if (!pattern || pattern.length < MIN_MATCH_LENGTH) {
    return menuItems.slice(0, DEFAULT_RECORDS_SHOWN);
  }

  let menusCopy = JSON.parse(JSON.stringify(menuItems));
  for (const item of menusCopy) {
    item.score = commandScore(item.fullLabel, pattern);
  }

  menusCopy = menusCopy.filter((item) => item.score > 0);
  menusCopy.sort((item1, item2) => item2.score - item1.score);

  return menusCopy.slice(0, DEFAULT_RECORDS_SHOWN);
}
