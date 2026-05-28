import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import useLauncherStore from "@/utils/launcherStore";
import { getCommandLabelAndPlaceholder } from "@/utils/configs/commands";
import { DEBOUNCE_DELAY } from "@/utils/configs/constants";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import debounce from "@/utils/debounce";

interface PaletteHeaderProps {
  listboxId: string;
  activeOptionId?: string;
  // True when the body is already showing its skeleton loader. Suppresses
  // the header spinner so the same loading state isn't double-indicated.
  bodyLoaderVisible?: boolean;
}

function PaletteHeader({ listboxId, activeOptionId, bodyLoaderVisible = false }: PaletteHeaderProps) {
  const filter = useLauncherStore((state) => state.filter);
  const isLoading = useLauncherStore((state) => state.isLoading);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const setFilter = useLauncherStore((state) => state.setFilter);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(filter);

  const debouncedSetFilter = useMemo(
    () => debounce((value: string) => setFilter(value), DEBOUNCE_DELAY),
    [setFilter]
  );

  useEffect(() => () => debouncedSetFilter.cancel(), [debouncedSetFilter]);

  // Sync local input when store filter changes (eg. enterMode pre-fills).
  useEffect(() => {
    setInputValue(filter);
  }, [filter]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setInputValue(next);

    if (commandMode) {
      setFilter(next);
    } else {
      debouncedSetFilter(next);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
      }
    }, 0);
    return () => clearTimeout(id);
  }, [commandMode]);

  const [label] = getCommandLabelAndPlaceholder(commandMode);

  const renderHint = () => {
    if (isLoading && !bodyLoaderVisible) {
      return <Spinner className="text-muted-foreground" />;
    }
    if (!commandMode) {
      return (
        <div className="flex items-center gap-x-2 text-muted-foreground">
          <span className="hidden whitespace-nowrap font-mono text-xs sm:block">More actions</span>
          <Badge
            variant="outline"
            aria-hidden="true"
            className="h-5 min-w-5 rounded-full border-border px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
          >
            Tab
          </Badge>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex items-center gap-x-3 border-b border-border px-[21px]">
      {commandMode ? (
        <Badge
          variant="outline"
          className="h-5 min-w-5 rounded-full border-border px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
        >
          {label}
        </Badge>
      ) : (
        <Search className="text-muted-foreground" size={16} aria-hidden="true" />
      )}
      <input
        id="snl-filter"
        ref={inputRef}
        role="combobox"
        aria-label="Search"
        aria-controls={listboxId}
        aria-expanded={true}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        className="m-[16px_0px] flex-1 border-none bg-transparent font-mono text-[15px] tracking-tight text-foreground outline-none placeholder:text-muted-foreground/70 focus:outline-none active:outline-none"
        placeholder="Type to search..."
        value={inputValue}
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {renderHint()}
    </div>
  );
}

export default PaletteHeader;
