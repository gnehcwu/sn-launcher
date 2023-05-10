const prefix = window?.location?.hostname || '';
const menuKey = `${prefix}-SN-LAUNCH-MENU`;
const applicationKey = `${prefix}-SN-LAUNCH-APPLICATION`;

function getStoredData(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (res) => {
      resolve(JSON.parse(res[key] ?? null));
    });
  });
}

function setStoreData(key, data) {
  const stringifiedData = { [key]: JSON.stringify(data) };
  return new Promise((resolve) => {
    chrome.storage.local.set(stringifiedData, () => {
      resolve();
    });
  });
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
