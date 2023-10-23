/**
 * Extracts menu items from an array of menu objects and returns an array of extracted menu items.
 * @param {Array} menuItems - An array of menu objects.
 * @returns {Array} An array of extracted menu items.
 */
export default function extractMenu(menuItems = []) {
  function traverse({ label, route, subItems }, parentLabel) {
    let fullLabel = parentLabel ? `${parentLabel} / ${label}` : label;
    // Add spaces around parentheses to improve search results
    fullLabel = fullLabel.replace('(', '( ').replace(')', ' )');

    const target = route?.params?.target || route?.url;
    if (target) {
      return {
        key: crypto.randomUUID(),
        target,
        label,
        parentLabel,
        fullLabel,
      };
    }

    // Collect external links
    if (route?.external) {
      const { url } = route.external;
      // Remove the external link icon from the label to improve search results
      const externalFullLabel = fullLabel.replace(' ➚', '');
      return {
        key: crypto.randomUUID(),
        target: url,
        label,
        parentLabel,
        fullLabel: externalFullLabel,
      };
    }

    if (subItems) {
      return subItems.flatMap((subItem) => traverse(subItem, fullLabel));
    }

    return [];
  }

  try {
    return menuItems.flatMap((menu) => traverse(menu));
  } catch (_) {
    return [];
  }
}
