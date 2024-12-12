import browser from 'webextension-polyfill';
import { SN_LAUNCHER_ACTIONS } from '../utilities/configs/constants';
import { LauncherActionValue } from 'types';

interface MessageRequest {
  action: typeof SN_LAUNCHER_ACTIONS[keyof typeof SN_LAUNCHER_ACTIONS];
  url?: string;
}

const isInvalidUrl = (url: string): boolean => {
  return url.includes('chrome://') || url.includes('chrome.google.com');
};

async function getActiveTab(): Promise<browser.Tabs.Tab | undefined> {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

async function notifyContent(action: LauncherActionValue): Promise<void> {
  try {
    const activeTab = await getActiveTab();

    if (!activeTab?.id || !activeTab.url || isInvalidUrl(activeTab.url)) {
      return;
    }

    await browser.tabs.sendMessage(activeTab.id, { action });
  } catch (error) {
    console.error('SN Launcher: Error notifying content:', error);
  }
}

(browser.action || browser.browserAction).onClicked.addListener(() => {
  notifyContent(SN_LAUNCHER_ACTIONS.TOGGLE_LAUNCHER_COMMAND);
});

browser.commands.onCommand.addListener((command: string) => {
  if (Object.values(SN_LAUNCHER_ACTIONS).includes(command as LauncherActionValue)) {
    notifyContent(command as LauncherActionValue);
  }
});

browser.runtime.onMessage.addListener(async (request: MessageRequest) => {
  try {
    const { action, url } = request || {};

    if (action === SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND && url) {
      await browser.tabs.create({ url, active: true });
    }
  } catch (error) {
    console.error('SN Launcher: Error handling message:', error);
  }
});
