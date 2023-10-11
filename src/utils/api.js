import getToken from '../utils/getToken';
import messageBackground from './messageBackground';
import extractMenu from '../utils/extractMenu';

/**
 * Checks if a token exists and returns it.
 *
 * @returns {[boolean, string]} A tuple containing a boolean indicating if a token exists and the token string.
 */
function checkToken() {
  const token = getToken();
  return [token?.length > 0, token];
}

/**
 * Fetches data from the specified URL using the x-usertoken header for authentication.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Array>} - A promise that resolves to an array of data.
 */
export async function fetchData(url) {
  try {
    const [isValidToken, token] = checkToken();
    if (!isValidToken) return [];

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

/**
 * Fetches an instance record from the ServiceNow instance using the provided script.
 * @param {string} script - The script to execute on the ServiceNow instance.
 * @returns {Promise<string|null|false>} - A Promise that resolves with the response text if successful, null if there was an error, or false if the token is invalid.
 */
export async function fetchInstanceRecord(script) {
  try {
    const [isValidToken, token] = checkToken();
    if (!isValidToken) return null;

    const { protocol, host } = window.location;
    const endpoint = `${protocol}//${host}/sys.scripts.do`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        script: script,
        runscript: 'Run script',
        sysparm_ck: token,
        sys_scope: 'e24e9692d7702100738dc0da9e6103dd',
        quota_managed_transaction: 'on',
      }).toString(),
    });

    return await res.text();
  } catch (_) {
    return null;
  }
}

/**
 * Fetches the user's history from the ServiceNow instance.
 * @returns {Promise<Array>} An array of history items, each containing a key, fullLabel, subLabel, and target.
 */
export async function fetchHistory() {
  function mapHistoryItem(item) {
    return {
      key: item.id,
      fullLabel: item.prettyTitle,
      subLabel: item.description || item.title,
      target: item.url,
    };
  }

  const endpoint = 'api/now/ui/history';
  const res = await fetchData(endpoint);

  return res?.list?.map(mapHistoryItem) || [];
}

/**
 * Fetches a list of apps from the server.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of app objects.
 */
export async function fetchApps() {
  function mapAppItem(item) {
    const name = item.name || item.scope || item.sys_id;
    return {
      key: item.sys_id,
      label: name,
      subLabel: `Switch to ${name} scope`,
      fullLabel: name,
    };
  }

  const endpoint =
    'api/now/table/sys_scope?sysparm_query=ORDERBYDESCsys_updated_on&sysparm_display_value=true&sysparm_fields=sys_id%2Cscope%2Cname';
  const data = await fetchData(endpoint);
  return data?.map(mapAppItem) || [];
}

/**
 * Fetches the menus from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of menu items.
 */
export async function fetchMenus() {
  const endpoint = 'api/now/ui/polaris/menu';
  const res = await fetchData(endpoint);

  const menu = res?.[0]?.subItems || [];
  return extractMenu(menu);
}

/**
 * Clears all data stored in local storage, session storage, and indexedDB.
 * @returns {Promise<void>} A Promise that resolves when all data has been cleared.
 */
export async function clearCache() {
  localStorage.clear();
  sessionStorage.clear();

  const dbs = await indexedDB.databases?.();

  if (!dbs || dbs.length < 1) return;

  const tasks = dbs.map(
    (db) =>
      new Promise((resolve, reject) => {
        const tryToDelete = indexedDB.deleteDatabase(db);
        tryToDelete.onsuccess = resolve;
        tryToDelete.onerror = reject;
        tryToDelete.onblocked = reject;
      }),
  );
  try {
    await Promise.allSettled(tasks);
  } catch (err) {
    /* ignore */
  }

  try {
    const cacheNames = await caches.keys();
    if (cacheNames && cacheNames.length > 0) {
      cacheNames.forEach((key) => caches.delete(key));
    }
  } catch (_) {
    /* ignore */
  }
}

/**
 * Switches to the specified ServiceNow application scope by ID.
 * @param {string} appId - The ID of the application to switch to.
 * @returns {Promise<void>} - A Promise that resolves when the application has been successfully switched to.
 */
export async function switchToAppById(appId) {
  try {
    if (!appId) return;

    const [isValidToken, token] = checkToken();
    if (!isValidToken) return;

    const payload = { app_id: appId };
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-WantSessionNotificationMessages': false,
      'x-usertoken': token,
    };

    const { protocol, host } = window.location;
    const endpoint = `${protocol}//${host}/api/now/ui/concoursepicker/application`;

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

/**
 * Searches the ServiceNow documentation for the given input and opens the results in a new tab.
 * @param {string} input - The search query to be used for searching the documentation.
 */
export function searchDoc(input) {
  const docUrl = `https://docs.servicenow.com/search?q=${encodeURIComponent(input)}`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: docUrl });
}

/**
 * Searches for a ServiceNow component using the input query and opens the component search URL in a new tab.
 * @param {string} input - The search query to use for finding a ServiceNow component.
 */
export function searchComponent(input) {
  const componentSearchUrl = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&query=${input}&order_by=score&limit=120&offset=0&categories[]=uib_component`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: componentSearchUrl });
}

/**
 * Navigates to a specific tab in the application.
 *
 * @param {string} segmentUrl - The URL segment for the tab to navigate to.
 */
export function gotoTab(segmentUrl) {
  const gotoUrl = `${location.protocol}//${window.location.host}/${segmentUrl}`;
  messageBackground({ action: 'snl-open-tab-form-launcher', url: gotoUrl });
}

/**
 * Navigates to a ServiceNow page based on the given segment.
 * If the segment ends with ".do", it navigates to a form page.
 * If the segment ends with ".list", it navigates to a list page.
 * @param {string} segment - The segment of the page to navigate to.
 */
export function goto(segment) {
  const URL_PREFIX = 'now/nav/ui/classic/params/target/';

  let matched = segment.match(/(.+)\.(do|list)$/);
  if (matched && matched[1]) {
    const target = matched[1];
    const suffix = matched[2];
    switch (suffix) {
      case 'do':
        gotoTab(`${URL_PREFIX}${target}.do`);
        break;
      case 'list':
        gotoTab(`${URL_PREFIX}${target}_list.do`);
        break;
      default:
        gotoTab(`${URL_PREFIX}${segment}`);
    }
  } else {
    gotoTab(`${URL_PREFIX}${segment}`);
  }
}
