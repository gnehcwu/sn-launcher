import type { CommandItem } from '@/utils/types';
import { SPECIAL_CHARS } from '@/utils/configs/constants';

interface Route {
  params?: {
    target?: string;
  };
  url?: string;
  external?: {
    url: string;
  };
}

interface MenuItem {
  label?: string;
  route?: Route;
  subItems?: MenuItem[];
  parentLabel?: string;
}

function formatLabel(label: string): string {
  return label
    .replace('(', '( ')
    .replace(')', ' )')
    .replace(SPECIAL_CHARS.EXTERNAL_LINK, '');
}

export default function extractMenu(menuItems: MenuItem[] = []): CommandItem[] {
  if (!Array.isArray(menuItems)) {
    throw new TypeError('SN Launcher: menuItems must be an array');
  }

  function traverse(
    { label, route, subItems }: MenuItem,
    parentLabel?: string
  ): CommandItem[] {
    // Labelless items can still be containers (no own row, but their subItems
    // descend with the parent label). Skip building a row for them.
    const hasOwnLabel = typeof label === 'string' && label.length > 0;
    const fullLabel = hasOwnLabel
      ? parentLabel
        ? `${parentLabel}${SPECIAL_CHARS.SEPARATOR}${label}`
        : label
      : parentLabel;
    const formattedLabel = fullLabel ? formatLabel(fullLabel) : '';

    const target = route?.params?.target || route?.url;
    if (target && formattedLabel) {
      return [
        {
          key: `menu:${target}:${formattedLabel}`,
          target,
          label,
          parentLabel,
          fullLabel: formattedLabel,
        },
      ];
    }

    if (route?.external?.url && formattedLabel) {
      return [
        {
          key: `menu:${route.external.url}:${formattedLabel}`,
          target: route.external.url,
          label,
          parentLabel,
          fullLabel: formattedLabel,
        },
      ];
    }

    if (subItems?.length) {
      return subItems.flatMap((subItem) => traverse(subItem, fullLabel));
    }

    return [];
  }

  try {
    return menuItems.flatMap((menu) => traverse(menu));
  } catch (error) {
    console.error('SN Launcher: Error processing menu items:', error);
    return [];
  }
}
