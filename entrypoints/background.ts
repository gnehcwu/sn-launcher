import { browser } from "wxt/browser";
import {
  SN_LAUNCHER_ABOUT_URL,
  SN_LAUNCHER_ACTIONS,
  SN_LAUNCHER_COMMAND_SHORTCUTS,
  SN_LAUNCHER_SETTINGS_MENU_ID,
} from "@/utils/configs/constants";
import type { LauncherActionValue } from "@/utils/types";

interface MessageRequest {
  action: (typeof SN_LAUNCHER_ACTIONS)[keyof typeof SN_LAUNCHER_ACTIONS];
  url?: string;
}

export default defineBackground(() => {
  const isInvalidUrl = (url: string): boolean => {
    return url.includes("chrome://") || url.includes("chrome.google.com");
  };

  async function getActiveTab(): Promise<Browser.tabs.Tab | undefined> {
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
      console.error("SN Launcher: Error notifying content:", error);
    }
  }

  browser.action?.onClicked?.addListener(() => {
    notifyContent(SN_LAUNCHER_ACTIONS.TOGGLE_LAUNCHER_COMMAND);
  });

  browser.commands.onCommand.addListener((command: string) => {
    if (
      Object.values(SN_LAUNCHER_ACTIONS).includes(
        command as LauncherActionValue
      )
    ) {
      notifyContent(command as LauncherActionValue);
    }
  });

  browser.runtime.onMessage.addListener(async (request: MessageRequest) => {
    try {
      const { action, url } = request || {};

      if (action === SN_LAUNCHER_ACTIONS.OPEN_TAB_COMMAND && url) {
        await browser.tabs.create({ url, active: true });
      } else if (action === SN_LAUNCHER_ACTIONS.OPEN_OPTIONS_COMMAND) {
        await browser.runtime.openOptionsPage();
      }
    } catch (error) {
      console.error("SN Launcher: Error handling message:", error);
    }
  });

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "shortcuts",
      title: "Shortcuts",
      contexts: ["action"],
    });

    for (const [key, config] of Object.entries(SN_LAUNCHER_COMMAND_SHORTCUTS)) {
      if (!config || !config.isContextMenu) continue;
      browser.contextMenus.create({
        id: key,
        parentId: "shortcuts",
        title: config.title,
        contexts: ["action"],
      });
    }

    browser.contextMenus.create({
      id: SN_LAUNCHER_SETTINGS_MENU_ID,
      title: "Settings",
      contexts: ["action"],
    });

    browser.contextMenus.create({
      id: "about",
      title: "More about SN Launcher",
      contexts: ["action"],
    });
  });

  browser.contextMenus.onClicked.addListener((info) => {
    const { menuItemId } = info;

    if (menuItemId === "about") {
      browser.tabs.create({ url: SN_LAUNCHER_ABOUT_URL, active: true });
    } else if (menuItemId === SN_LAUNCHER_SETTINGS_MENU_ID) {
      browser.runtime.openOptionsPage();
    } else if (
      Object.keys(SN_LAUNCHER_COMMAND_SHORTCUTS).includes(menuItemId as string)
    ) {
      notifyContent(menuItemId as LauncherActionValue);
    }
  });
});
