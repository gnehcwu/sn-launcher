/**
 * Extracts menu items from an array of menu objects and returns an array of extracted menu items.
 * @param {Array} menuItems - An array of menu objects.
 * @returns {Array} An array of extracted menu items.
 */
export default function extractMenu(menuItems = []) {
  const results = [];

  function traverse({ label, route, subItems }, parentLabel) {
    let fullLabel = parentLabel ? `${parentLabel} / ${label}` : label;
    fullLabel = fullLabel.replace('(', '( ').replace(')', ' )');

    const target = route?.params?.target || route?.url;
    if (target) {
      results.push({
        key: crypto.randomUUID(),
        target,
        label,
        parentLabel,
        fullLabel,
      });
    }

    // For external links
    if (route?.external) {
      const { url } = route.external;
      const externalFullLabel = fullLabel.replace(' ➚', '');
      results.push({
        key: crypto.randomUUID(),
        target: url,
        label,
        parentLabel,
        fullLabel: externalFullLabel,
      });
    }

    if (subItems) {
      subItems.forEach((subItem) => traverse(subItem, fullLabel));
    }
  }

  menuItems.map((menu) => traverse(menu));
  return results;
}
