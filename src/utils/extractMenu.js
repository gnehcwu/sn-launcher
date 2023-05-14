export default function extractMenu(menuItems = []) {
  const results = [];

  function traverse(obj, parentLabel) {
    const { label, route, subItems } = obj;
    const fullLabel = parentLabel ? `${parentLabel} / ${label}` : label;
    if (route?.params?.target) {
      results.push({
        key: crypto.randomUUID(),
        target: route?.params?.target,
        label,
        parentLabel,
        fullLabel,
      });
    }

    // For external links
    if (route?.external) {
      const { url } = route.external;
      results.push({ key: crypto.randomUUID(), target: url, label, parentLabel, fullLabel });
    }

    if (subItems) {
      subItems.forEach((subItem) => traverse(subItem, fullLabel));
    }
  }

  menuItems.map((menu) => traverse(menu));
  return results;
}
