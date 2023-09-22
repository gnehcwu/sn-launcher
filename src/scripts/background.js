import browser from 'webextension-polyfill';

/**
 * Get currently active browser tab
 * @returns current active tab
 */
async function getActiveTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

/**
 * Notify content script with given action type
 */
async function notifyContent(action) {
  const activeTab = await getActiveTab();

  if (activeTab.url.includes('chrome://') || activeTab.url.includes('chrome.google.com')) return;

  browser.tabs.sendMessage(activeTab.id, { action });
}

// Listener for clicking on extension icon
(browser.action || browser.browserAction).onClicked.addListener(function () {
  notifyContent('snl-toggle-launcher');
});

// Listener for registered command
browser.commands.onCommand.addListener((command) => {
  if (command === 'snl-toggle-launcher') {
    notifyContent('snl-toggle-launcher');
  }
});

// Open new tab
browser.runtime.onMessage.addListener((request, _, sendResponse) => {
  const { action, url } = request || {};

  if (action === 'snl-open-tab-form-launcher') {
    browser.tabs.create({ url, active: true }).then(({ openerTabId }) => {
      sendResponse({ openerTabId });
    });
  }

  // Keep connection alive util sendResponse been called
  return true;
});
