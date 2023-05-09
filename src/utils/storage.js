const key = 'SN-LAUNCH-MENU';

export function getStoredMenu() {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (res) => {
      resolve(JSON.parse(res[key] ?? null));
    });
  });
}

export function setStoredMenu(menu) {
  const data = { [key]: JSON.stringify(menu) };
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      resolve();
    });
  });
}

export function removeStoredMenu() {
  return chrome.storage.local.remove([key]);
}

removeStoredMenu();
