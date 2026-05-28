import { useEffect, useMemo, useRef, useState } from "react";
import { Github, Search, CornerDownLeft } from "lucide-react";
import { browser } from "wxt/browser";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
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
      className={`group flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40 ${
        selected ? "-translate-y-1" : "hover:-translate-y-0.5 active:scale-[0.98]"
      }`}
    >
      <div
        className={`aspect-[16/10] w-full overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-300 ease-out ${
          selected
            ? "border-primary shadow-[0_14px_30px_-16px_rgba(0,0,0,0.32)]"
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
      <div className="flex flex-col items-center gap-1">
        <span
          className={`text-xs leading-tight transition-colors duration-200 ${
            selected ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={`h-px rounded-full bg-primary transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            selected ? "w-5 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}

type PreviewRow = {
  title: string;
  sub: string;
  parent?: string;
};

const PREVIEW_ROWS: PreviewRow[] = [
  { title: "Incident", sub: "incident.list", parent: "Service Desk › Incident" },
  { title: "Change Request", sub: "change_request.list", parent: "Change › All" },
  { title: "Problem", sub: "problem.list", parent: "Problem › Open" },
  { title: "Knowledge", sub: "kb_knowledge.list", parent: "Knowledge › Articles" },
  { title: "Users", sub: "sys_user.list", parent: "User Administration › Users" },
  { title: "Service Catalog", sub: "sc_cat_item.list", parent: "Service Catalog › Catalog Definitions" },
  { title: "Business Rules", sub: "sys_script.list", parent: "System Definition › Business Rules" },
  { title: "CMDB", sub: "cmdb_ci.list", parent: "Configuration › All" },
];

function PalettePreview() {
  return (
    <div className="relative grid h-[516px] w-full grid-rows-[min-content_1fr_min-content] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-x-3 border-b border-border px-[21px]">
        <Search className="text-muted-foreground" size={16} />
        <div className="my-[16px] flex-1 font-mono text-[15px] tracking-tight text-muted-foreground">
          Type to search...
        </div>
        <div className="flex cursor-default items-center gap-x-2">
          <span className="hidden whitespace-nowrap font-mono text-xs text-muted-foreground sm:block">
            More actions
          </span>
          <Badge
            variant="outline"
            className="h-5 min-w-5 rounded-full border-border px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
          >
            Tab
          </Badge>
        </div>
      </div>

      <ul className="flex min-h-0 flex-col py-1.5">
        {PREVIEW_ROWS.map((row, i) => {
          const active = i === 0;
          return (
            <li
              key={row.title}
              className={`relative mx-1.5 flex min-h-0 flex-1 cursor-default items-center gap-x-3 rounded-md px-[10px] font-mono transition-colors duration-100 ${
                active ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary transition-opacity duration-100 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-sm text-foreground">{row.title}</span>
                <span className="line-clamp-1 block text-xs text-muted-foreground">{row.sub}</span>
              </span>
              {row.parent && (
                <Badge
                  variant="outline"
                  className="hidden h-5 min-w-5 items-center justify-center whitespace-nowrap rounded-full border-border px-1.5 font-mono text-xs text-muted-foreground tracking-tight sm:inline-flex"
                >
                  {row.parent}
                </Badge>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex cursor-default flex-row items-center justify-between border-t border-border px-[21px] py-3 font-mono text-xs text-muted-foreground">
        <span className="tabular-nums">{PREVIEW_ROWS.length} of 48</span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span>to navigate</span>
          <span className="mx-1.5 opacity-50">·</span>
          <Kbd>
            <CornerDownLeft size={12} />
          </Kbd>
          <span>to select</span>
        </span>
      </div>
    </div>
  );
}

function Options() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const previewRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isMac = useMemo(
    () => typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent),
    []
  );

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
  }, [theme]);

  useEffect(() => {
    const idx = THEME_OPTIONS.findIndex((o) => o.value === theme);
    thumbRefs.current[idx < 0 ? 0 : idx]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background font-mono text-foreground">
      <div className="mx-auto max-w-[920px] px-8 pb-24 pt-16">
        <header className="mb-14 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Pick a look.</h1>
            <p className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span>Six themes for SN Launcher.</span>
            </p>
          </div>
          <a
            href="https://github.com/gnehcwu/sn-launcher"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View SN Launcher on GitHub"
            title="View on GitHub"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
        </header>

        <section
          role="radiogroup"
          aria-label="Theme"
          className="mb-20 grid grid-cols-3 gap-6 sm:grid-cols-6"
        >
          {THEME_OPTIONS.map((opt, i) => (
            <ThemeThumbnail
              key={opt.value}
              theme={opt.value}
              label={opt.label}
              selected={theme === opt.value}
              onSelect={() => handleSelect(opt.value)}
              buttonRef={(el) => {
                thumbRefs.current[i] = el;
              }}
            />
          ))}
        </section>

        <section>
          <div
            className="flex justify-center rounded-3xl p-8 sm:p-14"
            style={{
              backgroundColor: "oklch(0.99 0 0)",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, oklch(0.5 0 0 / 0.18) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          >
            <div ref={previewRef} className="w-full max-w-[720px]">
              <PalettePreview />
            </div>
          </div>

          <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Kbd className="text-[10px]">{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd className="text-[10px]">⇧</Kbd>
            <Kbd className="text-[10px]">L</Kbd>
            <span>on any ServiceNow instance.</span>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Options;
