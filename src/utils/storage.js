import browser from 'webextension-polyfill';

const prefix = window?.location?.hostname || '';
const menuKey = `${prefix}-SN-LAUNCH-MENU`;
const applicationKey = `${prefix}-SN-LAUNCH-APPLICATION`;

async function getStoredData(key) {
  try {
    const data = await browser.storage.local.get(key);
    return JSON.parse(data[key] ?? null);
  } catch (_) {
    return null;
  }
}

async function setStoreData(key, data) {
  const stringifiedData = { [key]: JSON.stringify(data) };
  try {
    await browser.storage.local.set(stringifiedData);
  } catch (_) {
    /* ignore */
  }
}

export async function getStoredMenu() {
  return await getStoredData(menuKey);
}

export async function setStoredMenu(menu) {
  return await setStoreData(menuKey, menu);
}

export async function getStoredApplications() {
  return await getStoredData(applicationKey);
}

export async function setStoredApplication(applications) {
  return await setStoreData(applicationKey, applications);
}

async function clearStore() {
  await setStoreData(menuKey, []);
  await setStoreData(applicationKey, []);
}

// For local dev without local storage cache
// clearStore();
