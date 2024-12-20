import type { CommandItem } from '@/types';

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
  label: string;
  route?: Route;
  subItems?: MenuItem[];
  parentLabel?: string;
}

const SPECIAL_CHARS = {
  EXTERNAL_LINK: ' ➚',
  SEPARATOR: ' / ',
} as const;

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
    const fullLabel = parentLabel 
      ? `${parentLabel}${SPECIAL_CHARS.SEPARATOR}${label}`
      : label;
    const formattedLabel = formatLabel(fullLabel);

    const target = route?.params?.target || route?.url;
    if (target) {
      return [{
        key: crypto.randomUUID(),
        target,
        label,
        parentLabel,
        fullLabel: formattedLabel,
      }];
    }

    if (route?.external?.url) {
      return [{
        key: crypto.randomUUID(),
        target: route.external.url,
        label,
        parentLabel,
        fullLabel: formattedLabel,
      }];
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
