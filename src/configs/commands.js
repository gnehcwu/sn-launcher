import { fetchAndStoreMenu } from '../utils/api';

async function clearCache() {
  localStorage.clear();
  sessionStorage.clear();

  const dbs = await indexedDB.databases();
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
    console.log(err);
  }
}

async function refresh() {
  await fetchAndStoreMenu();
}

function searchDoc(input) {
  const docUrl = `https://docs.servicenow.com/search?q=${encodeURIComponent(input)}`;
  window.open(docUrl, '_blank').focus();
}

function searchComponent(input) {
  const componentSearchUrl = `https://developer.servicenow.com/dev.do#!/reference/next-experience/components?&query=${input}&order_by=score&limit=120&offset=0&categories[]=uib_component`;
  window.open(componentSearchUrl, '_blank').focus();
}

export function gotoTab(segmentUrl) {
  const gotoUrl = `${location.protocol}//${window.location.host}/${segmentUrl}`;
  window.open(gotoUrl, '_blank').focus();
}

/**
 * Shortcut for direct submit from input
 * @param {string} segment - input source for shortcut navigation
 * @returns void
 */
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

export const modeActionMapping = {
  'Search document': searchDoc,
  'Search component': searchComponent,
};

const commands = [
  {
    key: crypto.randomUUID(),
    label: 'Clear cache',
    action: clearCache,
    description: 'clear client cache',
  },
  {
    key: crypto.randomUUID(),
    label: 'Refresh menu',
    action: refresh,
    description: 'refresh all menu items',
  },
  // { key: crypto.randomUUID(), label: 'Go to', action: goto },
  {
    key: crypto.randomUUID(),
    label: 'Search document',
    action: searchDoc,
    mode: 'Search document',
    description: 'search against Servicenow documentation',
  },
  {
    key: crypto.randomUUID(),
    label: 'Search component',
    action: searchComponent,
    mode: 'Search component',
    description: 'search next experience components',
  },
];

export default commands;
