import Fuse from 'fuse.js';
import { DEFAULT_RECORDS_SHOWN, MIN_MATCH_LENGTH } from '../configs/constants';

const filterOptions = {
  isCaseSensitive: false,
  includeScore: true,
  shouldSort: true,
  includeMatches: true,
  findAllMatches: false,
  minMatchCharLength: MIN_MATCH_LENGTH,
  keys: [
    'parentLabel',
    {
      name: 'label',
      weight: 2,
    },
  ],
};

export default function filterMenu(menuItems, pattern) {
  if (!menuItems) return [];

  if (!pattern || pattern.length < MIN_MATCH_LENGTH) {
    const newMenuItems = menuItems
      .slice(0, DEFAULT_RECORDS_SHOWN)
      .map(({ key, label, parentLabel, target, action, mode, description }) => {
        return {
          item: {
            key,
            label,
            parentLabel,
            target,
            action,
            mode,
            description,
          },
        };
      });
    return newMenuItems;
  }

  const fuse = new Fuse(menuItems, filterOptions);
  return fuse.search(pattern).slice(0, DEFAULT_RECORDS_SHOWN);
}
