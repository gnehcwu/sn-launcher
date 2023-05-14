import Fuse from 'fuse.js';
import { DEFAULT_RECORDS_SHOWN, MIN_MATCH_LENGTH } from '../configs/constants';

const filterOptions = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: false,
  threshold: 0.5,
  minMatchCharLength: MIN_MATCH_LENGTH,
  useExtendedSearch: true,
  keys: ['fullLabel'],
};

export default function filterMenu(menuItems, pattern, overrides = {}) {
  if (!menuItems) return [];

  if (!pattern || pattern.length < MIN_MATCH_LENGTH) {
    const newMenuItems = menuItems
      .slice(0, DEFAULT_RECORDS_SHOWN)
      .map(({ key, label, parentLabel, fullLabel, target, action, mode, description }) => {
        return {
          item: {
            key,
            label,
            parentLabel,
            target,
            action,
            mode,
            description,
            fullLabel: fullLabel ? fullLabel : parentLabel ? `${parentLabel} / ${label}` : label,
          },
        };
      });
    return newMenuItems;
  }

  const fuse = new Fuse(menuItems, { ...filterOptions, ...overrides });
  return fuse.search(pattern).slice(0, DEFAULT_RECORDS_SHOWN);
}
