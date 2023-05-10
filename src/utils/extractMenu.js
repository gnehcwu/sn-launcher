export default function extractMenu(menuItems = []) {
  const results = [];

  function traverse(obj, parentLabel) {
    const { label, route, subItems } = obj;
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
