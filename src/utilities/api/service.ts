import messageBackground from '../browser/messageBackground';
import useLauncherStore from '../../store/launcherStore';
import extractMenu from './extractMenu';
import commands from '../configs/commands';
import {
  SN_LAUNCHER_SEARCH_DOC_URL,
  SN_LAUNCHER_SEARCH_COMPONENT_URL,
  SN_LAUNCHER_SCOPE_ENDPOINT,
  SN_LAUNCHER_TABLE_ENDPOINT,
  SN_LAUNCHER_MENU_ENDPOINT,
  SN_LAUNCHER_SWITCH_APP_ENDPOINT,
  SN_LAUNCHER_TAB_PREFIX,
  SN_LAUNCHER_ACTIONS,
  SN_LAUNCHER_ABOUT_URL,
  SN_LAUNCHER_SCRIPT_ENDPOINT,
} from '../configs/constants';

/**
 * Base URL configuration
 */
const getBaseUrl = () => {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
};

/**
 * Common headers configuration
 */
const getAuthHeaders = (token: string, contentType = 'application/json') => ({
  'x-usertoken': token,
  'Content-Type': contentType,
});

/**
 * Checks if a token exists and returns it.
 *
 * @returns {[boolean, string]} A tuple containing a boolean indicating if a token exists and the token string.
 */
function checkToken(): [boolean, string] {
  const token = useLauncherStore.getState().token;
  return [token?.length > 0, token];
}

/**
 * Fetches data from the specified URL using the x-usertoken header for authentication.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Array>} - A promise that resolves to an array of data.
 */
export async function fetchData(url: string) {
  try {
    const [isValidToken, token] = checkToken();
    if (!isValidToken) return [];

    const endpoint = `${getBaseUrl()}/${url}`;
    const res = await fetch(endpoint, {
      headers: getAuthHeaders(token),
      mode: 'cors',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`SN Launcher: HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.result ?? [];
  } catch (err) {
    console.error('SN Launcher: Error fetching data:', err);
    return [];
  }
}

/**
 * Fetches result from the ServiceNow instance using the provided script.
 * @param {string} script - The script to execute on the ServiceNow instance.
 * @returns {Promise<string|null|false>} - A Promise that resolves with the response text if successful, null if there was an error, or false if the token is invalid.
 */
export async function fetchResultViaScript(script: string) {
  try {
    const [isValidToken, token] = checkToken();
    if (!isValidToken) return null;

    const endpoint = `${getBaseUrl()}/${SN_LAUNCHER_SCRIPT_ENDPOINT}`;

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
  function mapHistoryItem(item: any) {
    return {
      key: item.id,
      fullLabel: item.prettyTitle,
      subLabel: item.description || item.title,
      target: item.url,
    };
  }

  const endpoint = 'api/now/ui/history';
  const res = await fetchData(endpoint);

  return res?.list?.map(mapHistoryItem);
}

/**
 * Fetches a list of apps from the server.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of app objects.
 */
export async function fetchScopes() {
  function mapScopeItem(item: any) {
    const name = item.name || item.scope || item.sys_id;
    return {
      key: item.sys_id,
      label: name,
      subLabel: `Switch to ${name} scope`,
      fullLabel: name,
    };
  }

  const data = await fetchData(SN_LAUNCHER_SCOPE_ENDPOINT);
  return data?.map(mapScopeItem);
}

/**
 * Fetches all tables.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of table objects.
 */
export async function fetchTables() {
  const res = await fetchData(SN_LAUNCHER_TABLE_ENDPOINT);

  const tables = res?.map(({ name, label }: { name: string; label: string }) => ({
    key: crypto.randomUUID(),
    fullLabel: `${label}: ${name}`,
    target: `${name}_list.do`,
  }));

  return tables;
}

/**
 * Fetches the menus from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of menu items.
 */
export async function fetchMenus() {
  const res = await fetchData(SN_LAUNCHER_MENU_ENDPOINT);

  const menu = res?.[0]?.subItems || [];
  return extractMenu(menu);
}

export async function fetchCommands() {
  return commands.filter((command) => command.visible !== false);
}

/**
 * Clears all data stored in local storage, session storage, and indexedDB.
 * @returns {Promise<void>} A Promise that resolves when all data has been cleared.
 */
export async function clearCache() {
  const clearPromises: Promise<void>[] = [];

  // Clear storage
  clearPromises.push(
    (async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        throw err;
      }
    })(),
  );

  // Clear caches
  clearPromises.push(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (err) {
        throw err;
      }
    })(),
  );

  // Clear indexedDB
  clearPromises.push(
    (async () => {
      try {
        const dbs = (await indexedDB.databases()) as IDBDatabaseInfo[];
        await Promise.all(
          dbs.map(async (db) => {
            if (db.name) {
              await new Promise<void>((resolve, reject) => {
                const tryToDelete = indexedDB.deleteDatabase(db.name as string);
                tryToDelete.onsuccess = () => resolve();
                tryToDelete.onerror = (event) => {
                  reject(event);
                };
                tryToDelete.onblocked = (event) => {
                  reject(event);
                };
              });
            }
          }),
        );
      } catch (err) {
        throw err;
      }
    })(),
  );

  try {
    await Promise.all(clearPromises);
  } catch (err) {
    console.error('SN Launcher: Error clearing cache:', err);
  } finally {
    window?.top?.location?.reload();
  }
}

/**
 * Switches to the specified ServiceNow application scope by ID.
 * @param {string} appId - The ID of the application to switch to.
 * @returns {Promise<void>} - A Promise that resolves when the application has been successfully switched to.
 */
export async function switchToAppById(appId: string) {
  try {
    if (!appId) return;

    const [isValidToken, token] = checkToken();
    if (!isValidToken) return;

    const payload = { app_id: appId };
    const endpoint = `${getBaseUrl()}/${SN_LAUNCHER_SWITCH_APP_ENDPOINT}`;

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`SN Launcher: HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    if (!result?.error) {
      await clearCache();
    }
  } catch (error) {
    console.error('SN Launcher: Error switching app:', error);
    window?.top?.location?.reload();
  }
}

/**
 * Searches the ServiceNow documentation for the given input and opens the results in a new tab.
 * @param {string} input - The search query to be used for searching the documentation.
 */
export function searchDoc(input: string) {
  const docUrl = `${SN_LAUNCHER_SEARCH_DOC_URL}${encodeURIComponent(input)}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: docUrl });
}

/**
 * Searches for a ServiceNow component using the input query and opens the component search URL in a new tab.
 * @param {string} input - The search query to use for finding a ServiceNow component.
 */
export function searchComponent(input: string) {
  const componentSearchUrl = `${SN_LAUNCHER_SEARCH_COMPONENT_URL}${encodeURIComponent(input)}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: componentSearchUrl });
}

/**
 * Navigates to a specific tab in the application.
 *
 * @param {string} segmentUrl - The URL segment for the tab to navigate to.
 */
export function gotoTab(segmentUrl: string) {
  const gotoUrl = `${getBaseUrl()}/${segmentUrl}`;
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: gotoUrl });
}

/**
 * Navigates to a ServiceNow page based on the given segment.
 * If the segment ends with ".do", it navigates to a form page.
 * If the segment ends with ".list", it navigates to a list page.
 * @param {string} segment - The segment of the page to navigate to.
 */
export function goto(segment: string) {
  let matched = segment.match(/(.+)\.(do|list)$/);
  if (matched && matched[1]) {
    const target = matched[1];
    const suffix = matched[2];
    switch (suffix) {
      case 'do':
        gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${target}.do`);
        break;
      case 'list':
        gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${target}_list.do`);
        break;
      default:
        gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${segment}`);
    }
  } else {
    gotoTab(`${SN_LAUNCHER_TAB_PREFIX}${segment}`);
  }
}

/**
 * Opens the About page in a new tab.
 * This function sends a message to the background script to open the ServiceNow Launcher's About URL.
 */
export function about() {
  messageBackground({ action: SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND, url: SN_LAUNCHER_ABOUT_URL });
}
