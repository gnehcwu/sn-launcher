import { memo } from "react";
import { Kbd } from "@/components/ui/kbd";

interface PaletteFooterProps {
  filteredCount: number;
  totalCount: number;
}

const KEYBOARD_SYMBOLS = {
  ENTER: "⏎",
  UP: "↑",
  DOWN: "↓",
  ESC: "esc",
} as const;

function PaletteFooter({ totalCount, filteredCount }: PaletteFooterProps) {
  const result = `${Math.min(filteredCount, totalCount)}/${totalCount}`;

  return (
    <div className="flex cursor-default flex-row items-center justify-between border-t border-border px-[21px] py-3 font-mono text-xs text-muted-foreground">
      <p className="tabular-nums">{result}</p>
      <div className="hidden items-center gap-x-5 sm:flex">
        <span className="inline-flex items-center gap-x-1">
          <Kbd aria-label="Close" className="px-1 py-px text-xs">
            {KEYBOARD_SYMBOLS.ESC}
          </Kbd>
          <span>to close</span>
        </span>
        <span className="inline-flex items-center gap-x-1">
          <Kbd aria-label="Open" className="px-1 py-px text-xs">
            {KEYBOARD_SYMBOLS.ENTER}
          </Kbd>
          <span>to open</span>
        </span>
        <span className="inline-flex items-center gap-x-1">
          <Kbd aria-label="Move up" className="px-1 py-px text-xs">
            {KEYBOARD_SYMBOLS.UP}
          </Kbd>
          <Kbd aria-label="Move down" className="px-1 py-px text-xs">
            {KEYBOARD_SYMBOLS.DOWN}
          </Kbd>
          <span>to select</span>
        </span>
      </div>
    </div>
  );
}

export default memo(PaletteFooter);
