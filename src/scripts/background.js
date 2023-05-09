/**
 * Get currently active browser tab
 * @returns current active tab
 */
async function getActiveTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

/**
 * Notify content script with given action type
 */
async function notifyContent(action) {
  const activeTab = await getActiveTab();

  if (activeTab.url.includes('chrome://') || activeTab.url.includes('chrome.google.com')) return;

  chrome.tabs.sendMessage(activeTab.id, { action });
}

// Listener for clicking on extension icon
chrome.action.onClicked.addListener(function () {
  notifyContent('toggle-launcher');
});

// Listener for registered command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-launcher') {
    notifyContent('toggle-launcher');
  }
});
