import React, { useEffect, useRef, useMemo } from "react";
import useLauncherStore from "@/utils/launcherStore";
import { isValidShortcut, isValidSysId } from "@/utils/validation";
import { isCompactLayoutMode, getCommandLabelAndPlaceholder } from "@/utils/configs/commands";
import { COMMAND_MODES, DEBOUNCE_DELAY } from "@/utils/configs/constants";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { CornerDownLeft } from "lucide-react";
import debounce from "lodash.debounce";
import "@/assets/tailwind.css";

type HintConfig = {
  text?: string;
  icon: React.ReactNode;
};

const HINT_CONFIG: Record<string, HintConfig> = {
  loadingCompact: {
    icon: <Spinner className="text-neutral-700 dark:text-neutral-300" />
  },
  compact: {
    text: "Search",
    icon: <CornerDownLeft className="text-neutral-500 dark:text-neutral-400" size={18} />,
  },
  default: {
    text: "More actions",
    icon: (
      <Badge
        variant="outline"
        className="border-neutral-300 dark:border-neutral-600 h-5 min-w-5 rounded-full px-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-400"
      >
        Tab
      </Badge>
    ),
  },
};

function Filter() {
  const filter = useLauncherStore((state) => state.filter);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);
  const filterRef = useRef<HTMLInputElement>(null);
  const isCompact = isCompactLayoutMode(commandMode);
  const [inputValue, setInputValue] = useState(filter);

  const debouncedUpdateFilter = useMemo(
    () => debounce((value: string) => updateFilter(value), DEBOUNCE_DELAY),
    [updateFilter]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;
    setInputValue(inputVal);

    if (isValidSysId(inputVal)) {
      updateCommandMode(COMMAND_MODES.FIND_RECORD);
      updateFilter(inputVal);
    } else if (isValidShortcut(inputVal)) {
      updateCommandMode(COMMAND_MODES.GO_TO);
      updateFilter(inputVal);
    } else if (commandMode) {
      updateFilter(inputVal);
    } else {
      debouncedUpdateFilter(inputVal);
    }
  };

  const renderHints = () => {
    if (isCompact && isLoading) {
      return HINT_CONFIG.loadingCompact.icon;
    }

    const hintConfig = isCompact ? HINT_CONFIG.compact : !commandMode ? HINT_CONFIG.default : null;

    if (!hintConfig) return null;

    return (
      <div className="flex items-center gap-x-2 cursor-default">
        <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 hidden sm:block whitespace-nowrap">
          {hintConfig.text}
        </span>
        {hintConfig.icon}
      </div>
    );
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filterRef.current) {
        filterRef.current.focus();
        filterRef.current.selectionStart = filterRef.current.selectionEnd = filterRef.current.value.length;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [commandMode]);

  const [label] = getCommandLabelAndPlaceholder(commandMode);

  return (
    <div
      className={`border-neutral-300 dark:border-neutral-600 flex items-center p-[0px_21px] gap-x-3 ${
        isCompact ? "border-none" : "border-b"
      }`}
    >
      {commandMode && (
        <Badge
          variant="secondary"
          className="text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 h-5 min-w-5 rounded-full px-1.5 font-mono text-xs cursor-default tracking-tight"
        >
          {label}
        </Badge>
      )}
      <input
        id="filter"
        className="dark:text-neutral-300 text-neutral-950 outline-none border-none box-shadow-none focus:outline-none active:outline-none m-[16px_0px] flex-1 bg-transparent text-sm font-mono"
        ref={filterRef}
        aria-label="Search"
        placeholder="Type to search..."
        value={inputValue}
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {renderHints()}
    </div>
  );
}

export default Filter;
