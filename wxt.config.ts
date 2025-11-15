import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { SN_LAUNCHER_ACTIONS } from "./utils/configs/constants";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  }),
  manifest: {
    permissions: ["tabs", "activeTab", "contextMenus", "scripting"],
    web_accessible_resources: [
      {
        resources: ["main-world.js"],
        matches: ["*://*/*"],
      },
    ],
    commands: {
      [SN_LAUNCHER_ACTIONS.TOGGLE_LAUNCHER_COMMAND]: {
        suggested_key: {
          windows: "Ctrl+Shift+L",
          mac: "Command+Shift+L",
          chromeos: "Ctrl+Shift+L",
          linux: "Ctrl+Shift+L",
        },
        description: "Open SN Launcher",
      },
      [SN_LAUNCHER_ACTIONS.SWITCH_SCOPE_COMMAND]: {
        suggested_key: {
          windows: "Alt+Shift+S",
          mac: "Alt+Shift+S",
          chromeos: "Alt+Shift+S",
          linux: "Alt+Shift+S",
        },
        description: "Switch scope",
      },
      [SN_LAUNCHER_ACTIONS.SEARCH_TABLE_COMMAND]: {
        suggested_key: {
          windows: "Alt+Shift+A",
          mac: "Alt+Shift+A",
          chromeos: "Alt+Shift+A",
          linux: "Alt+Shift+A",
        },
        description: "Search table",
      },
      [SN_LAUNCHER_ACTIONS.SEARCH_HISTORY_COMMAND]: {
        suggested_key: {
          windows: "Alt+Shift+H",
          mac: "Alt+Shift+H",
          chromeos: "Alt+Shift+H",
          linux: "Alt+Shift+H",
        },
        description: "Search history",
      },
    },
  },
});
