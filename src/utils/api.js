import getToken from '../utils/getToken';
import messageBackground from './messageBackground';
import {
  getStoredApplications,
  getStoredMenu,
  setStoredApplication,
  setStoredMenu,
} from '../utils/storage';
import extractMenu from '../utils/extractMenu';

export async function fetchData(url) {
  try {
    const token = getToken();
    if (!token) return [];

    const { protocol, host } = window.location;
    const endpoint = `${protocol}//${host}/${url}`;
    const res = await fetch(endpoint, {
      headers: {
        'x-usertoken': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });
    const data = await res.json();
    return data.result;
  } catch (err) {
    return [];
  }
}

async function fetchMenu() {
  const endpoint = 'api/now/ui/polaris/menu';
  const res = await fetchData(endpoint);
  return res[0]?.subItems;
}

async function fetchApps() {
  const endpoint =
    'api/now/table/sys_scope?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_display_value=true&sysparm_fields=sys_id%2Cscope%2Cname';
  const applications = await fetchData(endpoint);
  return applications.map((item) => ({
    key: item.sys_id,
    label: item.name || item.scope || item.sys_id,
    description: `switch to ${item.name} scope`,
    fullLabel: item.name || item.scope || item.sys_id,
  }));
}

export async function refreshApplications() {
  const applications = await fetchApps();
  await setStoredApplication(applications);
  return applications;
}

export async function refreshApps() {
  await refreshMenu();
  await refreshApplications();
}

export async function fetchOrRetrieveApps() {
  const storedApplications = await getStoredApplications();

  if (!storedApplications || storedApplications.length < 1) {
    return await refreshApplications();
  }

  return storedApplications;
}

export async function refreshMenu() {
  const menu = await fetchMenu();
  const extractedMenu = extractMenu(menu);
  await setStoredMenu(extractedMenu);
  return extractedMenu;
}

export async function fetchOrRetrieveMenu() {
  const storedMenu = await getStoredMenu();

  if (!storedMenu || storedMenu.length < 1) {
    return await refreshMenu();
  }

  return storedMenu;
}

export async function clearCache() {
  localStorage.clear();
  sessionStorage.clear();

  const dbs = await indexedDB.databases?.();

  if (!dbs || dbs.length < 1) return;

  const tasks = dbs.map(
    (db) =>
      new Promise((resolve, reject) => {
        const tryToDelete = indexedDB.deleteDatabase(db);
        tryToDelete.onsuccess = resolve();
        tryToDelete.onerror = reject;
        tryToDelete.onblocked = reject;
      }),
  );
  try {
    await Promise.all(tasks);
  } catch (err) {
    /* ignore */
  }
}

export async function switchToAppById(appId) {
  const payload = { app_id: appId };
  const headers = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-WantSessionNotificationMessages': false,
    'x-usertoken': getToken(),
  };

  const { protocol, host } = window.location;
  const endpoint = `${protocol}//${host}/api/now/ui/concoursepicker/application`;
  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result?.error) {
      clearCache();
      window.top.location.reload();
    }
  } catch (error) {
    /* ignore */
  }
}

export function searchDoc(input) {
  const docUrl = `https://docs.servicenow.com/search?q=${encodeURIComponent(input)}`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: docUrl });
}

export function searchComponent(input) {
  const componentSearchUrl = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&query=${input}&order_by=score&limit=120&offset=0&categories[]=uib_component`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: componentSearchUrl });
}

export function gotoTab(segmentUrl) {
  const gotoUrl = `${location.protocol}//${window.location.host}/${segmentUrl}`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: gotoUrl });
}

export function goto(segment) {
  // if (segment.match(/^[a-zA-Z0-9]{32}$/)) {
  //   gotoTab(`sys_db_object.do?sys_id=${segment}`);
  //   return;
  // }
  let matched = segment.match(/(.+)\.do$/);
  if (matched) {
    gotoTab(`now/nav/ui/classic/params/target/${matched[1]}.do`);
  } else {
    matched = segment.match(/(.+)\.list$/);
    if (matched) {
      gotoTab(`now/nav/ui/classic/params/target/${matched[1]}_list.do`);
    }
  }
}
