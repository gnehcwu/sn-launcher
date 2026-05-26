import { useEffect, useMemo, useRef, useState } from "react";
import {
  Github,
  Search,
  CornerDownLeft,
  TriangleAlert,
  GitPullRequestArrow,
  AlertCircle,
  BookOpen,
  Users,
  ShoppingCart,
  FileCode2,
  Server,
} from "lucide-react";
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
    <div className="bg-white dark:bg-black h-full w-full flex flex-col">
      <div className="px-2 py-1.5 border-b border-neutral-300 dark:border-neutral-600">
        <div className="h-[3px] w-9 rounded-full bg-neutral-300 dark:bg-neutral-600" />
      </div>
      <div className="flex-1 px-2 py-2 flex flex-col justify-center gap-1.5">
        <div className="h-[3px] w-[62%] rounded-full bg-neutral-400/70 dark:bg-neutral-500" />
        <div className="h-[3px] w-[78%] rounded-full bg-neutral-400/70 dark:bg-neutral-500" />
        <div className="h-[3px] w-[48%] rounded-full bg-neutral-400/70 dark:bg-neutral-500" />
      </div>
      <div className="px-2 py-1.5 border-t border-neutral-300 dark:border-neutral-600">
        <div className="h-[3px] w-3 rounded-full bg-neutral-300 dark:bg-neutral-600" />
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
      className={`group rounded-2xl cursor-pointer flex flex-col items-center gap-2.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground/40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        selected ? "-translate-y-1" : "hover:-translate-y-0.5 active:scale-[0.98]"
      }`}
    >
      <div
        className={`w-full aspect-[16/10] rounded-xl overflow-hidden border transition-[border-color,box-shadow] duration-300 ease-out ${
          selected
            ? "border-primary shadow-[0_14px_30px_-16px_rgba(0,0,0,0.32)]"
            : "border-border group-hover:border-foreground/40"
        }`}
      >
        {isSystem ? (
          <div className="grid grid-cols-2 h-full">
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
            selected ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={`h-px bg-primary rounded-full transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            selected ? "w-5 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </div>
    </button>
  );
}

type PreviewRow = {
  icon: React.ReactNode;
  title: string;
  sub: string;
  parent?: string;
};

const PREVIEW_ROWS: PreviewRow[] = [
  { icon: <TriangleAlert size={16} />, title: "Incident", sub: "incident.list", parent: "Service Desk › Incident" },
  { icon: <GitPullRequestArrow size={16} />, title: "Change Request", sub: "change_request.list", parent: "Change › All" },
  { icon: <AlertCircle size={16} />, title: "Problem", sub: "problem.list", parent: "Problem › Open" },
  { icon: <BookOpen size={16} />, title: "Knowledge", sub: "kb_knowledge.list", parent: "Knowledge › Articles" },
  { icon: <Users size={16} />, title: "Users", sub: "sys_user.list", parent: "User Administration › Users" },
  { icon: <ShoppingCart size={16} />, title: "Service Catalog", sub: "sc_cat_item.list", parent: "Service Catalog › Catalog Definitions" },
  { icon: <FileCode2 size={16} />, title: "Business Rules", sub: "sys_script.list", parent: "System Definition › Business Rules" },
  { icon: <Server size={16} />, title: "CMDB", sub: "cmdb_ci.list", parent: "Configuration › All" },
];

function PalettePreview() {
  return (
    <div className="h-[516px] border border-neutral-300 dark:border-neutral-600 relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full grid grid-rows-[min-content_1fr_min-content] overflow-hidden">
      <div className="border-b border-neutral-300 dark:border-neutral-600 flex items-center px-[21px] gap-x-3">
        <Search className="text-neutral-500 dark:text-neutral-400" size={16} />
        <div className="my-[16px] flex-1 text-sm font-mono text-neutral-500 dark:text-neutral-400">
          Type to search...
        </div>
        <div className="flex items-center gap-x-2 cursor-default">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 hidden sm:block whitespace-nowrap">
            More actions
          </span>
          <Badge
            variant="outline"
            className="border-neutral-300 dark:border-neutral-600 h-5 min-w-5 rounded-full px-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-400"
          >
            Tab
          </Badge>
        </div>
      </div>

      <ul className="py-1.5 flex flex-col min-h-0">
        {PREVIEW_ROWS.map((row, i) => (
          <li
            key={row.title}
            className={`mx-1.5 px-[8px] rounded-md flex flex-1 min-h-0 items-center gap-x-3 font-mono cursor-default ${
              i === 0 ? "bg-muted/90 dark:bg-muted/80" : ""
            }`}
          >
            <div className="w-5 h-5 shrink-0 inline-flex items-center justify-center text-neutral-950 dark:text-neutral-200">
              {row.icon}
            </div>
            <span className="flex-1 min-w-0">
              <span className="block text-sm dark:text-neutral-200 text-neutral-950 line-clamp-1">
                {row.title}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {row.sub}
              </span>
            </span>
            {row.parent && (
              <Badge
                variant="outline"
                className="border-neutral-300 dark:border-neutral-600 h-5 min-w-5 rounded-full px-1.5 font-mono text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400 hidden sm:inline-flex items-center justify-center tracking-tight"
              >
                {row.parent}
              </Badge>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-row items-center justify-between p-[12px_21px] border-t border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 text-xs font-mono cursor-default">
        <span>{PREVIEW_ROWS.length} of 48</span>
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

  // Global keyboard nav: arrow keys + 1-6 cycle themes without requiring
  // the user to Tab into the radiogroup first. Skipped while a text input
  // or contenteditable is focused so we don't trap normal typing.
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

      // Number keys 1-6 jump directly to a theme.
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

  // Focus the selected thumbnail on mount so arrow-key nav is immediately
  // discoverable via the focus ring.
  useEffect(() => {
    const idx = THEME_OPTIONS.findIndex((o) => o.value === theme);
    thumbRefs.current[idx < 0 ? 0 : idx]?.focus({ preventScroll: true });
    // Intentionally one-shot: only on initial mount, not every theme change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="max-w-[920px] mx-auto px-8 pt-16 pb-24">
        <header className="mb-14 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Pick a look.</h1>
            <p className="mt-1.5 text-sm text-muted-foreground inline-flex items-center gap-1.5 flex-wrap">
              <span>Six themes for SN Launcher.</span>
            </p>
          </div>
          <a
            href="https://github.com/gnehcwu/sn-launcher"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View SN Launcher on GitHub"
            title="View on GitHub"
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          >
            <Github className="w-[18px] h-[18px]" />
          </a>
        </header>

        <section
          role="radiogroup"
          aria-label="Theme"
          className="mb-20 grid grid-cols-3 sm:grid-cols-6 gap-6"
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
            className="rounded-3xl p-8 sm:p-14 flex justify-center"
            style={{
              backgroundColor: "oklch(0.99 0 0)",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, oklch(0.5 0 0 / 0.18) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          >
            <div ref={previewRef} className="w-full max-w-[789px]">
              <PalettePreview />
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
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
