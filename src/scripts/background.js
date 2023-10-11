import browser from 'webextension-polyfill';

/**
 * Retrieves the currently active tab in the browser window.
 * @returns {Promise<browser.tabs.Tab>} A promise that resolves with the active tab object.
 */
async function getActiveTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

/**
 * Sends a message to the content script of the active tab.
 * @param {string} action - The action to be performed by the content script.
 * @returns {Promise<void>}
 */
async function notifyContent(action) {
  const activeTab = await getActiveTab();

  const { id, url } = activeTab || {};
  if (!id || url.includes('chrome://') || url.includes('chrome.google.com')) {
    return;
  }

  browser.tabs.sendMessage(id, { action });
}

/**
 * Listener for clicking on extension icon
 * @param {Function} callback - The function to be called when the icon is clicked.
 * @returns {void}
 */
(browser.action || browser.browserAction).onClicked.addListener(function () {
  notifyContent('snl-toggle-launcher');
});

/**
 * Listener for registered command
 * @param {string} command - The command to be executed.
 * @returns {void}
 */
browser.commands.onCommand.addListener((command) => {
  if (command === 'snl-toggle-launcher') {
    notifyContent('snl-toggle-launcher');
  }
});

/**
 * Listener for messages sent from content scripts.
 * Opens a new tab if the message action is 'snl-open-tab-form-launcher'.
 * @param {Object} request - The message object sent from the content script.
 * @param {string} request.action - The action to be performed.
 * @param {string} request.url - The URL to open in a new tab.
 * @returns {Promise<void>}
 */
browser.runtime.onMessage.addListener(async (request) => {
  const { action, url } = request || {};

  if (action === 'snl-open-tab-form-launcher') {
    await browser.tabs.create({ url, active: true });
  }
});
