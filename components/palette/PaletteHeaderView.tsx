import React from "react";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import type { CommandModeOrNull } from "@/utils/types";

interface PaletteHeaderViewProps {
  /** Current command mode — drives the leading badge vs. search icon and the
   *  trailing hint. Null = default menu (search icon + "More actions" hint). */
  mode: CommandModeOrNull;
  /** Display label for the mode badge (only shown when `mode` is set). */
  label?: string;
  isLoading?: boolean;
  // True when the body is already showing its skeleton loader. Suppresses the
  // header spinner so the same loading state isn't double-indicated.
  bodyLoaderVisible?: boolean;
  placeholder?: string;
  // Input wiring. The live header passes a controlled value + change handler +
  // ref (for autofocus); the settings preview passes a static read-only value.
  inputValue: string;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  readOnly?: boolean;
  listboxId?: string;
  activeOptionId?: string;
}

/**
 * Presentational header for the command palette: leading mode-badge / search
 * icon, the filter input, and the trailing hint (spinner / "More actions" Tab
 * badge). All behaviour (store reads, debounce, autofocus) lives in the
 * PaletteHeader container; this is shared with the settings live preview so the
 * header chrome never has to be duplicated.
 */
function PaletteHeaderView({
  mode,
  label = "",
  isLoading = false,
  bodyLoaderVisible = false,
  placeholder = "Type to search...",
  inputValue,
  onInputChange,
  inputRef,
  readOnly = false,
  listboxId,
  activeOptionId,
}: PaletteHeaderViewProps) {
  const renderHint = () => {
    if (isLoading && !bodyLoaderVisible) {
      return <Spinner className="text-muted-foreground" />;
    }
    if (!mode) {
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
      {mode ? (
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
        placeholder={placeholder}
        value={inputValue}
        onChange={onInputChange}
        readOnly={readOnly}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      {renderHint()}
    </div>
  );
}

export default PaletteHeaderView;
