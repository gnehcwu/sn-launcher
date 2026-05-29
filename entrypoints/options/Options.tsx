import { useEffect, useMemo, useRef, useState } from "react";
import { Github, ArrowUpRight } from "lucide-react";
import { browser } from "wxt/browser";
import { Kbd } from "@/components/ui/kbd";
import PaletteCard from "@/components/palette/PaletteCard";
import PaletteHeaderView from "@/components/palette/PaletteHeaderView";
import MenuRow from "@/components/palette/MenuRow";
import PaletteFooter from "@/components/palette/PaletteFooter";
import { getSubActions } from "@/components/palette/sub-actions";
import commands from "@/utils/configs/commands";
import { COMMAND_MODES } from "@/utils/configs/constants";
import type { CommandItem } from "@/utils/types";
import {
  applyTheme,
  DEFAULT_THEME,
  getTheme,
  setTheme,
  subscribeTheme,
  THEMES,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/utils/theme";
import "@/assets/tailwind.css";

const REPO_URL = "https://github.com/gnehcwu/sn-launcher";

// Stronger than CSS's default ease-out — gives motion proper snap without
// looking abrupt. From Emil Kowalski's animation principles.
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type ViewKey = "theme" | "reference" | "about";

const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "theme", label: "Theme" },
  { key: "reference", label: "Reference" },
  { key: "about", label: "About" },
];

// Mirrors `manifest.commands` in wxt.config.ts. Kept in lockstep manually
// because the manifest config isn't importable at runtime from this entrypoint.
type ShortcutRow = { label: string; mod: (isMac: boolean) => string; key: string };
const SHORTCUTS: ShortcutRow[] = [
  { label: "Open palette", mod: (m) => (m ? "⌘" : "Ctrl"), key: "L" },
  { label: "Switch scope", mod: (m) => (m ? "⌥" : "Alt"), key: "S" },
  { label: "Search tables", mod: (m) => (m ? "⌥" : "Alt"), key: "A" },
  { label: "Search history", mod: (m) => (m ? "⌥" : "Alt"), key: "H" },
];

const ISSUES_URL = `${REPO_URL}/issues`;
const RELEASES_URL = `${REPO_URL}/releases`;

// Mirrors `manifest.permissions` in wxt.config.ts — kept in lockstep manually
// since the manifest isn't importable at runtime here.
const PERMISSIONS: { name: string; why: string }[] = [
  { name: "storage", why: "Saves your theme and caches menu / table / scope lists locally for instant results." },
  { name: "tabs", why: "Opens records, lists, and .do / .list pages in new tabs and toggles the palette on the active tab." },
  { name: "activeTab", why: "Acts on the ServiceNow tab you're currently viewing." },
  { name: "scripting", why: "Injects the palette UI and reads your instance session token so API calls authenticate as you." },
  { name: "contextMenus", why: "Adds the right-click menu entries that open the palette in a specific mode." },
];

const CREDITS: { name: string; role: string; url: string }[] = [
  { name: "WXT", role: "Extension framework", url: "https://wxt.dev" },
  { name: "React", role: "UI library", url: "https://react.dev" },
  { name: "Tailwind CSS", role: "Styling", url: "https://tailwindcss.com" },
  { name: "Zustand", role: "State management", url: "https://github.com/pmndrs/zustand" },
  { name: "shadcn/ui", role: "UI primitives", url: "https://ui.shadcn.com" },
  { name: "Lucide", role: "Icons", url: "https://lucide.dev" },
  { name: "Zod", role: "Schema validation", url: "https://zod.dev" },
];

// Content blocks cascade in just after the SectionHeader's own staggered reveal,
// so header + body read as one motion event. motion-safe only — reduced-motion
// users get the content with opacity, no movement. Mirrors SectionHeader's curve.
const REVEAL =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300";
const revealStyle = (index: number): React.CSSProperties => ({
  animationTimingFunction: EASE_OUT,
  animationDelay: `${140 + index * 60}ms`,
  animationFillMode: "both",
});

// A label → description list whose first column auto-sizes to its widest term
// and stays aligned across rows (no magic widths). Shared by Keyboard, Shortcuts,
// Permissions, and Built-with so they read as one consistent system.
function DefinitionGrid({
  rows,
}: {
  rows: { key: string; term: React.ReactNode; desc: React.ReactNode }[];
}) {
  return (
    <dl className="mt-3 grid grid-cols-[max-content_1fr] items-start gap-x-5 gap-y-2.5 text-sm">
      {rows.flatMap((r) => [
        <dt key={`${r.key}-t`} className="flex items-center gap-1 leading-5">
          {r.term}
        </dt>,
        <dd key={`${r.key}-d`} className="leading-5 text-muted-foreground">
          {r.desc}
        </dd>,
      ])}
    </dl>
  );
}

function MiniPalette() {
  return (
    <div className="flex h-full w-full flex-col bg-popover">
      <div className="border-b border-border px-2 py-1.5">
        <div className="h-[3px] w-9 rounded-full bg-border" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-2 py-2">
        <div className="h-[3px] w-[62%] rounded-full bg-muted-foreground/45" />
        <div className="h-[3px] w-[78%] rounded-full bg-muted-foreground/45" />
        <div className="h-[3px] w-[48%] rounded-full bg-muted-foreground/45" />
      </div>
      <div className="border-t border-border px-2 py-1.5">
        <div className="h-[3px] w-3 rounded-full bg-border" />
      </div>
    </div>
  );
}

interface ThemeThumbnailProps {
  theme: Theme;
  label: string;
  selected: boolean;
  onSelect: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function ThemeThumbnail({ theme, label, selected, onSelect, buttonRef }: ThemeThumbnailProps) {
  const isSystem = theme === THEMES.SYSTEM;
  const themeClass = theme === THEMES.LIGHT || isSystem ? "" : theme;

  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      style={{ transitionTimingFunction: EASE_OUT }}
      className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl outline-none transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40 active:scale-[0.97] ${
        selected ? "-translate-y-1.5" : "hover:-translate-y-1"
      }`}
    >
      <div
        style={{ transitionTimingFunction: EASE_OUT }}
        className={`aspect-[16/10] w-full overflow-hidden rounded-xl border-2 transition-[border-color,box-shadow] duration-300 ${
          selected
            ? "border-foreground shadow-[0_22px_44px_-18px_rgba(0,0,0,0.45)]"
            : "border-border group-hover:border-foreground/40"
        }`}
      >
        {isSystem ? (
          <div className="grid h-full grid-cols-2">
            <MiniPalette />
            <div className="dark h-full">
              <MiniPalette />
            </div>
          </div>
        ) : (
          <div className={`${themeClass} h-full`}>
            <MiniPalette />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`text-[13px] leading-none transition-colors duration-200 ${
            selected ? "font-semibold tracking-tight text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        {/* Transform-only animation: scale-x from center beats width transitions
            on perf, and the curve matches the rest of the page. */}
        <span
          aria-hidden
          style={{ transitionTimingFunction: EASE_OUT, transformOrigin: "center" }}
          className={`h-[2px] w-6 rounded-full bg-foreground transition-[transform,opacity] duration-300 ${
            selected ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}

// Sample rows shaped as real CommandItems so they feed straight into MenuRow.
const PREVIEW_ROWS: CommandItem[] = [
  { key: "incident", fullLabel: "Incident", subLabel: "incident.list", parentLabel: "Service Desk › Incident" },
  { key: "change_request", fullLabel: "Change Request", subLabel: "change_request.list", parentLabel: "Change › All" },
  { key: "problem", fullLabel: "Problem", subLabel: "problem.list", parentLabel: "Problem › Open" },
  { key: "kb_knowledge", fullLabel: "Knowledge", subLabel: "kb_knowledge.list", parentLabel: "Knowledge › Articles" },
  { key: "sys_user", fullLabel: "Users", subLabel: "sys_user.list", parentLabel: "User Administration › Users" },
  { key: "sc_cat_item", fullLabel: "Service Catalog", subLabel: "sc_cat_item.list", parentLabel: "Service Catalog › Catalog Definitions" },
  { key: "sys_script", fullLabel: "Business Rules", subLabel: "sys_script.list", parentLabel: "System Definition › Business Rules" },
  { key: "cmdb_ci", fullLabel: "CMDB", subLabel: "cmdb_ci.list", parentLabel: "Configuration › All" },
];

const noop = () => {};

// A non-interactive snapshot of the live palette, assembled from the exact same
// components it renders (PaletteCard / PaletteHeaderView / MenuRow /
// PaletteFooter) so any visual change to the palette shows here automatically —
// nothing to duplicate or keep in sync.
function PalettePreview() {
  return (
    <PaletteCard className="h-[516px] w-full shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]">
      <PaletteHeaderView mode={null} inputValue="" readOnly />
      <div role="listbox" aria-label="Commands" className="min-h-0 overflow-hidden px-3 py-2">
        {PREVIEW_ROWS.map((item, i) => (
          <MenuRow
            key={item.key}
            index={i}
            item={item}
            active={i === 0}
            onSelect={noop}
            onAction={noop}
          />
        ))}
      </div>
      <PaletteFooter filteredCount={PREVIEW_ROWS.length} totalCount={48} actionsAvailable />
    </PaletteCard>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={[
        "relative w-full rounded-md px-3 py-2 text-left text-[13px]",
        "transition-[background-color,color,transform] duration-150 ease-out",
        "active:scale-[0.985] motion-reduce:active:scale-100",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        active
          ? "bg-muted font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      ].join(" ")}
    >
      {/* Left accent bar — scales in from the top edge so the reveal has
          direction (matches top-down scan order), not just a pop of opacity. */}
      <span
        aria-hidden
        style={{ transitionTimingFunction: EASE_OUT, transformOrigin: "top" }}
        className={[
          "absolute top-1.5 bottom-1.5 -left-px w-[3px] rounded-full bg-foreground",
          "transition-[transform,opacity] duration-200",
          active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
        ].join(" ")}
      />
      {children}
    </button>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

// Title-first section header. Hairline rules and numbered eyebrows were
// scaffold; whitespace alone carries the hierarchy. Staggered entrance shifts
// timing based on which children are actually present.
function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  const enter =
    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300";
  const hasEyebrow = !!eyebrow;
  return (
    <header className="mb-14">
      {hasEyebrow && (
        <p
          className={`${enter} font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground`}
          style={{ animationTimingFunction: EASE_OUT, animationFillMode: "both" }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={`${enter} ${hasEyebrow ? "mt-4" : ""} font-display text-[44px] font-medium leading-[0.95] tracking-[-0.02em] text-foreground`}
        style={{
          animationTimingFunction: EASE_OUT,
          animationDelay: hasEyebrow ? "60ms" : "0ms",
          animationFillMode: "both",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`${enter} mt-5 text-[15px] leading-relaxed text-muted-foreground`}
          style={{
            animationTimingFunction: EASE_OUT,
            animationDelay: hasEyebrow ? "120ms" : "60ms",
            animationFillMode: "both",
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

interface ThemeSectionProps {
  theme: Theme;
  onSelect: (next: Theme) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
  thumbRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

function ThemeSection({ theme, onSelect, previewRef, thumbRefs }: ThemeSectionProps) {
  return (
    <>
      <SectionHeader
        title="Theme"
        subtitle="Six themes. Applied wherever the palette appears."
      />

      <section
        role="radiogroup"
        aria-label="Theme"
        className="mb-16 grid grid-cols-3 gap-6 sm:grid-cols-6"
      >
        {THEME_OPTIONS.map((opt, i) => (
          <ThemeThumbnail
            key={opt.value}
            theme={opt.value}
            label={opt.label}
            selected={theme === opt.value}
            onSelect={() => onSelect(opt.value)}
            buttonRef={(el) => {
              thumbRefs.current[i] = el;
            }}
          />
        ))}
      </section>

      {/* Preview stands on its own — no frame, no dot grid, no caption.
          The live demo is the demonstration; ornament around it competes. */}
      <div className="flex justify-center">
        <div ref={previewRef} className="w-full max-w-[820px]">
          <PalettePreview />
        </div>
      </div>
    </>
  );
}

// Representative items so getSubActions emits every conditional alternate for a
// mode (it gates on target / sysId). The run() callbacks are never invoked here —
// we only read each action's label + icon for the reference list.
const NOOP_CTX = { close: () => {} };
const SUBACTION_GROUPS: { title: string; actions: ReturnType<typeof getSubActions> }[] = [
  {
    title: "Nav menus & history",
    actions: getSubActions({ key: "menu:rep", fullLabel: "", target: "incident_list.do" }, null, NOOP_CTX),
  },
  {
    title: "Tables",
    actions: getSubActions(
      { key: "table:incident", fullLabel: "", target: "incident_list.do", sysId: "—" },
      COMMAND_MODES.TABLE,
      NOOP_CTX
    ),
  },
  {
    title: "Switch scope",
    actions: getSubActions({ key: "scope:rep", fullLabel: "" }, COMMAND_MODES.SWITCH_SCOPE, NOOP_CTX),
  },
  {
    title: "History",
    actions: getSubActions({ key: "history:rep", fullLabel: "", target: "incident.do" }, COMMAND_MODES.HISTORY, NOOP_CTX),
  },
].filter((g) => g.actions.length > 0);

function ReferenceSection({ isMac }: { isMac: boolean }) {
  const mod = isMac ? "⌘" : "Ctrl";
  // The palette hides `visible: false` entries (e.g. the internal Actions mode).
  const visibleCommands = commands.filter((c) => c.visible !== false);

  // Mirrors the bindings in Palette.tsx#handleKeydown. No runtime source for
  // keybindings, so this list is maintained alongside that handler.
  const keys: { combo: React.ReactNode; label: string }[] = [
    {
      combo: (
        <>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </>
      ),
      label: "Move between results",
    },
    { combo: <Kbd>⏎</Kbd>, label: "Run the selected command" },
    { combo: <Kbd>Tab</Kbd>, label: "Open the full command list, or exit the current mode" },
    {
      combo: (
        <>
          <Kbd>{mod}</Kbd>
          <Kbd>K</Kbd>
        </>
      ),
      label: "Show alternate actions for the highlighted row",
    },
    { combo: <Kbd>⌫</Kbd>, label: "Exit the current mode (when the filter is empty)" },
    { combo: <Kbd>esc</Kbd>, label: "Close the actions panel, or the palette" },
  ];

  return (
    <>
      <SectionHeader
        title="Reference"
        subtitle="Everything the palette can do, at a glance."
      />

      <section className="space-y-10">
        <div className={REVEAL} style={revealStyle(0)}>
          <h2 className="text-sm font-medium text-foreground">Commands</h2>
          <ul className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {visibleCommands.map((c) => (
              <li key={c.key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground">{c.fullLabel}</p>
                  {c.subLabel && <p className="text-xs text-muted-foreground">{c.subLabel}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={REVEAL} style={revealStyle(1)}>
          <h2 className="text-sm font-medium text-foreground">Keyboard</h2>
          <DefinitionGrid rows={keys.map((k) => ({ key: k.label, term: k.combo, desc: k.label }))} />
        </div>

        <div className={REVEAL} style={revealStyle(2)}>
          <h2 className="text-sm font-medium text-foreground">Row actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Press <Kbd className="mx-0.5">{mod}</Kbd>
            <Kbd>K</Kbd> on a highlighted row for its alternates.
          </p>
          <div className="mt-4 space-y-4">
            {SUBACTION_GROUPS.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-medium text-foreground">{g.title}</p>
                <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                  {g.actions.map((a) => (
                    <li key={a.key} className="inline-flex items-center gap-1.5">
                      <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5">
                        {a.icon}
                      </span>
                      {a.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
    >
      {children}
      <ArrowUpRight
        size={12}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
      />
    </a>
  );
}

function AboutSection({ isMac, version }: { isMac: boolean; version: string }) {
  const mod = isMac ? "⌘" : "Ctrl";
  return (
    <>
      <SectionHeader
        title="About"
        subtitle="A command palette for ServiceNow, local-first."
      />

      <section className="space-y-10">
        <div className={REVEAL} style={revealStyle(0)}>
          <h2 className="text-sm font-medium text-foreground">Getting started</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1 — Open any ServiceNow instance page.</li>
            <li>
              2 — Press <Kbd>{mod}</Kbd>
              <Kbd className="mx-0.5">⇧</Kbd>
              <Kbd>L</Kbd> to launch the palette.
            </li>
            <li>3 — Start typing to jump to a page, record, or table — or run a command.</li>
          </ol>
        </div>

        <div className={REVEAL} style={revealStyle(1)}>
          <h2 className="text-sm font-medium text-foreground">What it does</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>— Search nav menus to jump straight to any page.</li>
            <li>— Browse all tables, scopes, and recent history.</li>
            <li>
              — Open any record by sys_id, or any{" "}
              <code className="rounded bg-muted/60 px-1 py-px font-mono text-[11px] text-foreground">*.do</code>
              {" / "}
              <code className="rounded bg-muted/60 px-1 py-px font-mono text-[11px] text-foreground">*.list</code>{" "}
              shortcut.
            </li>
            <li>— Switch update set, impersonate a user, and act on the current record.</li>
            <li>— Search ServiceNow docs and Next Experience (Seismic) components in place.</li>
            <li>
              — Press <Kbd className="mx-0.5">Tab</Kbd> for the full command list,{" "}
              <Kbd className="mx-0.5">{mod}</Kbd>
              <Kbd>K</Kbd> on a row for its alternates.
            </li>
          </ul>
        </div>

        <div className={REVEAL} style={revealStyle(2)}>
          <h2 className="text-sm font-medium text-foreground">Shortcuts</h2>
          <DefinitionGrid
            rows={SHORTCUTS.map((s) => ({
              key: s.label,
              term: (
                <>
                  <Kbd>{s.mod(isMac)}</Kbd>
                  <Kbd>⇧</Kbd>
                  <Kbd>{s.key}</Kbd>
                </>
              ),
              desc: s.label,
            }))}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Customize at{" "}
            <code className="rounded bg-muted/60 px-1 py-px font-mono text-[11px] text-foreground">
              chrome://extensions/shortcuts
            </code>{" "}
            or{" "}
            <code className="rounded bg-muted/60 px-1 py-px font-mono text-[11px] text-foreground">
              about:addons
            </code>{" "}
            or your browser's keyboard shortcut settings.
          </p>
        </div>

        <div className={REVEAL} style={revealStyle(4)}>
          <h2 className="text-sm font-medium text-foreground">Privacy</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>— All operations are performed locally in your browser.</li>
            <li>— No data is collected or shared with any third party.</li>
            <li>— Manifest V3 is used to improve the privacy, security, and performance of the extension.</li>
          </ul>
        </div>

        <div className={REVEAL} style={revealStyle(6)}>
          <h2 className="text-sm font-medium text-foreground">Feedback</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Found a bug or have an idea? <ExternalLink href={ISSUES_URL}>Open an issue</ExternalLink> on
            GitHub. Check <ExternalLink href={RELEASES_URL}>recent releases</ExternalLink> for what's new
            {version ? ` (you're on v${version})` : ""}.
          </p>
        </div>

        <div className={REVEAL} style={revealStyle(7)}>
          <h2 className="text-sm font-medium text-foreground">Source</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            <ExternalLink href={REPO_URL}>github.com/gnehcwu/sn-launcher</ExternalLink>
          </p>
        </div>
      </section>
    </>
  );
}

function Options() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [view, setView] = useState<ViewKey>("theme");
  const previewRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isMac = useMemo(
    () => typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent),
    []
  );

  const version = useMemo(() => {
    try {
      return browser.runtime.getManifest().version;
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    getTheme().then(setThemeState);

    const onStorageChange = (
      changes: Record<string, Browser.storage.StorageChange>,
      area: Browser.storage.AreaName
    ) => {
      if (area !== "local" || !(THEME_STORAGE_KEY in changes)) return;
      const next = (changes[THEME_STORAGE_KEY].newValue as Theme) || DEFAULT_THEME;
      setThemeState(next);
    };
    browser.storage.onChanged.addListener(onStorageChange);
    return () => browser.storage.onChanged.removeListener(onStorageChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTheme((resolved) => {
      if (previewRef.current) applyTheme(previewRef.current, resolved);
    });
    return unsubscribe;
  }, []);

  const handleSelect = (next: Theme) => {
    setThemeState(next);
    setTheme(next).catch(() => {});
  };

  useEffect(() => {
    // Arrow-key / number-key theme navigation only applies on the Theme view.
    if (view !== "theme") return;

    const isTextTarget = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return el.isContentEditable;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTextTarget(event.target)) return;

      const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      const total = THEME_OPTIONS.length;
      const currentIndex = THEME_OPTIONS.findIndex((o) => o.value === theme);
      const base = currentIndex < 0 ? 0 : currentIndex;

      if (navKeys.includes(event.key)) {
        event.preventDefault();
        const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        const nextIndex = (base + delta + total) % total;
        handleSelect(THEME_OPTIONS[nextIndex].value);
        thumbRefs.current[nextIndex]?.focus();
        return;
      }

      const num = Number(event.key);
      if (Number.isInteger(num) && num >= 1 && num <= total) {
        event.preventDefault();
        const nextIndex = num - 1;
        handleSelect(THEME_OPTIONS[nextIndex].value);
        thumbRefs.current[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [theme, view]);

  // Focus the selected thumbnail when (re-)entering the Theme view.
  useEffect(() => {
    if (view !== "theme") return;
    const idx = THEME_OPTIONS.findIndex((o) => o.value === theme);
    thumbRefs.current[idx < 0 ? 0 : idx]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Reflect the active section in the browser tab title so users can
  // distinguish multiple open tabs of the options page.
  useEffect(() => {
    const sectionLabel = NAV_ITEMS.find((item) => item.key === view)?.label;
    document.title = sectionLabel ? `${sectionLabel} · SN Launcher` : "SN Launcher";
  }, [view]);

  // Console greeting for the curious — developer audience, so this is the
  // right easter egg surface. Fires once on mount.
  useEffect(() => {
    const v = version ? ` v${version}` : "";
    console.log(
      `%cSN Launcher${v}%c\nHi, developer. Bug or idea? → ${REPO_URL}`,
      "font: 600 13px ui-monospace, SFMono-Regular, Menlo, monospace; color: #111; background: #f5f5f4; padding: 4px 10px; border-radius: 4px;",
      "font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; color: #6b7280; line-height: 1.7; padding-left: 2px;"
    );
  }, [version]);

  return (
    <div className="min-h-screen bg-background font-mono text-foreground antialiased">
      <div className="mx-auto flex min-h-screen max-w-[1200px]">
        <aside
          aria-label="Settings navigation"
          className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border px-6 py-10"
        >
          {/* Compact inline lockup: icon + wordmark on a shared baseline.
              No ring, no drop shadow — the icon sits naturally, the way
              brand marks do in well-considered apps (Linear, Vercel). */}
          <div className="group/brand mb-14 flex items-center gap-2.5">
            <img
              src="/icon/96.png"
              alt=""
              aria-hidden="true"
              // Tiny tilt + press feedback on hover — a quiet wink on the
              // only logo moment on the page. Custom ease-out for snap.
              style={{ transitionTimingFunction: EASE_OUT }}
              className="h-7 w-7 shrink-0 rounded-[7px] transition-transform duration-300 group-hover/brand:-rotate-[6deg] group-hover/brand:scale-[1.08] group-active/brand:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
            />
            {/* `<p>` (not `<h1>`) so the visible section title in <main>
                remains the single page-level heading. */}
            <p className="font-display text-[15px] font-semibold leading-none tracking-[-0.02em] text-foreground">
              SN Launcher
            </p>
          </div>

          <nav aria-label="Sections" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavButton
                key={item.key}
                active={view === item.key}
                onClick={() => setView(item.key)}
              >
                {item.label}
              </NavButton>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 pt-4 text-xs text-muted-foreground">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-1.5 rounded outline-none transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Github size={12} aria-hidden="true" />
              <span>GitHub</span>
              <ArrowUpRight
                size={10}
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              />
            </a>
            {version && <span className="tabular-nums">v{version}</span>}
          </div>
        </aside>

        <main aria-label="Settings content" className="min-w-0 flex-1 px-12 pb-24 pt-12">
          {/* `key={view}` remounts on tab change so the entrance animation
              replays. Wrapper handles the cross-fade only; vertical motion
              belongs to SectionHeader's staggered children. Duration is
              tuned to overlap the children's stagger tails (~120-420ms) so
              the whole reveal reads as one motion event, not two layered ones. */}
          <div
            key={view}
            style={{ animationTimingFunction: EASE_OUT }}
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          >
            {view === "theme" ? (
              <ThemeSection
                theme={theme}
                onSelect={handleSelect}
                previewRef={previewRef}
                thumbRefs={thumbRefs}
              />
            ) : view === "reference" ? (
              <ReferenceSection isMac={isMac} />
            ) : (
              <AboutSection isMac={isMac} version={version} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Options;
