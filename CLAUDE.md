# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SN Launcher is a Manifest V3 browser extension (Chrome + Firefox) that injects a command-palette UI into ServiceNow instance pages. Built with [WXT](https://wxt.dev), React 19, Tailwind 4, and Zustand. shadcn/ui (new-york style, neutral base, lucide icons) is used for primitives in `components/ui`.

## Commands

- `npm run dev` — launch WXT dev mode for Chrome (uses `./.wxt/chrome-data` as the browser profile per `web-ext.config.ts`).
- `npm run dev:firefox` — same for Firefox.
- `npm run build` / `npm run build:firefox` — production build into `.output/`.
- `npm run zip` / `npm run zip:firefox` — packaged extension for store upload.
- `npm run postinstall` (runs automatically) — `wxt prepare` regenerates `.wxt/` types; rerun manually if TS can't resolve WXT globals like `defineBackground` / `defineContentScript`.

No test, lint, or typecheck scripts are configured.

## Architecture

### Three entrypoints (loaded by WXT from `entrypoints/`)

1. **`background.ts`** — service worker. Owns the extension keyboard commands (declared in `wxt.config.ts` → `manifest.commands`), the action-button click, and the right-click context menu generated from `SN_LAUNCHER_COMMAND_SHORTCUTS`. Translates all of those into a `browser.tabs.sendMessage` to the active tab's content script. Also handles `OPEN_TAB_COMMAND` messages from the content script to open new tabs (since content scripts can't call `browser.tabs.create`).
2. **`content.tsx`** — runs on `*://*/*`, mounts the `<Palette/>` React tree inside a WXT shadow-root UI (`createShadowRootUi`) so host-page CSS can't bleed in. Applies a `dark` class on the wrapper from `prefers-color-scheme`. Before mounting, it (a) registers the GCK message receiver and (b) injects `main-world.js`.
3. **`main-world.ts`** — runs in the page's MAIN world at `document_start`. Its only job is to read `window.g_ck` (the ServiceNow session/CSRF token) and `postMessage` it back to the content script (via `SN_LAUNCHER_SEND_GCK_EVENT`). The content script ↔ main-world split exists because isolated content scripts can't see page `window` globals.

### GCK token flow

`main-world.ts` polls `window.g_ck` → posts to `window` → `utils/resources/receiveGck.ts` listens and writes the token into the Zustand store. `Palette` refuses to render until `state.token` is set, and all ServiceNow API calls in `utils/api/service.ts` send it as the `x-usertoken` header. When touching auth, preserve this chain — there is no other code path that obtains the token.

### Palette state machine

The UI is driven by `commandMode` in `utils/launcherStore.ts` (Zustand). Modes live in the `COMMAND_MODES` enum in `utils/configs/constants.ts`:

- empty string `''` → default menu list (ServiceNow nav menus, fetched via `api/now/ui/polaris/menu`)
- `ACTIONS`, `SWITCH_SCOPE`, `TABLE`, `HISTORY` → "full layout" modes that show a scored list
- `FIND_RECORD`, `GO_TO`, `SEARCH_DOC`, `SEARCH_COMP` → "compact layout" modes (filter input only, no list — `isCompactLayoutMode` in `utils/configs/commands.ts`)

`components/palette/Palette.tsx` picks the source list per mode, runs it through `utils/scoring/scoreItems.ts` (filters by `fullLabel` using the custom `commandScore` algorithm, threshold `MIN_MATCH_LENGTH = 2`), and renders. `Enter` dispatches to `components/palette/palette-action.ts`, which has one branch per mode — that's the canonical place to add or modify a command's behavior.

`Tab` toggles into `ACTIONS` mode (the full command list). `Backspace` on empty filter exits the current mode. The Zustand `reset(isShown?)` is the centralized way to clear filter/selected/mode without dropping the panel — pass `false` to also hide.

### Adding a new command

1. Add the enum value to `COMMAND_MODES` in `utils/configs/constants.ts`.
2. Push an entry into the `commands` array in `utils/configs/commands.ts` (icon from lucide-react, optional `action` callback, `placeholderText` for the input).
3. If it shows a scored list, add a fetch hook (see `hooks/useTable.ts`, `useHistory.ts`, `useScope.ts` for the pattern) and wire it into `Palette.tsx`'s source-list selector.
4. Add a `case` to `palette-action.ts` for what `Enter` should do.
5. To give it an OS keyboard shortcut + context-menu entry, add to `SN_LAUNCHER_ACTIONS`, `SN_LAUNCHER_COMMAND_SHORTCUTS`, and `manifest.commands` in `wxt.config.ts`. The background script picks up the shortcut automatically as long as the action value is in `SN_LAUNCHER_ACTIONS`.

### Module conventions

- Path alias `@/*` → repo root (configured in `tsconfig.json` and mirrored in `wxt.config.ts` Vite resolve).
- `utils/api/service.ts` is the single place that talks to ServiceNow. All requests go through `fetchData` (GET with `x-usertoken`) or `fetchResultViaScript` (POST to `sys.scripts.do`). Don't bypass these — they centralize token handling and base-URL derivation from `window.location`.
- Content script → background uses `utils/browser/messageBackground.ts`. Background → content uses `browser.tabs.sendMessage` with the action constants.
- Tailwind v4 is loaded via the Vite plugin; the single CSS entry is `assets/tailwind.css`, imported by `Palette.tsx`. shadcn-style primitives are in `components/ui/` per `components.json`.

## Invalid host pages

`background.ts#isInvalidUrl` skips `chrome://` and `chrome.google.com` URLs — keep that filter when adding new tab-targeting code, otherwise `tabs.sendMessage` will throw on extension pages.

## Compact Instructions

Preserve:
1. Architecture decisions (NEVER summarize)
2. Modified files and key changes
3. Current verification status (pass/fail commands)
4. Open risks, TODOs, rollback notes
