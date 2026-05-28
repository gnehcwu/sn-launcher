import React, { memo } from "react";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { SPECIAL_CHARS } from "@/utils/configs/constants";
import type { CommandItem } from "@/utils/types";

interface MenuRowProps {
  index: number;
  item: CommandItem;
  active: boolean;
  onSelect: (index: number) => void;
  onAction: () => void;
  style?: React.CSSProperties;
}

const TRUNCATE_MAX = 50;

function truncateMiddle(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  const ellipsis = "…";
  const segments = str.split(SPECIAL_CHARS.SEPARATOR);

  if (segments.length === 1) {
    const charsToShow = maxLength - ellipsis.length;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return str.slice(0, frontChars) + ellipsis + str.slice(-backChars);
  }

  const separatorLength = SPECIAL_CHARS.SEPARATOR.length * (segments.length - 1);
  const availableChars = maxLength - separatorLength - segments.length * ellipsis.length;
  const charsPerSegment = Math.max(2, Math.floor(availableChars / segments.length));

  return segments
    .map((segment) => {
      if (segment.length <= charsPerSegment) return segment;
      const frontChars = Math.ceil(charsPerSegment / 2);
      const backChars = Math.floor(charsPerSegment / 2);
      return segment.slice(0, frontChars) + ellipsis + segment.slice(-backChars);
    })
    .join(SPECIAL_CHARS.SEPARATOR);
}

function MenuRowImpl({ index, item, active, onSelect, onAction, style }: MenuRowProps) {
  if (!item) {
    return (
      <div style={style} className="text-xs text-muted-foreground px-3 py-2">
        No data
      </div>
    );
  }

  const { icon, label, fullLabel, subLabel, parentLabel, target, description } = item;
  const title = label ?? fullLabel;
  const subTitle = subLabel || (target ? target.split("?")[0] : description);

  return (
    <Item
      id={`snl-row-${index}`}
      role="option"
      aria-selected={active}
      data-selected={active ? "true" : "false"}
      onMouseMove={() => onSelect(index)}
      onClick={onAction}
      onContextMenu={(e) => e.preventDefault()}
      style={style}
      size="sm"
      className={[
        // Layout
        "relative cursor-default items-center gap-0 gap-x-3 p-[4px_10px] font-mono",
        // No bg/color transition: selection changes at keyrepeat rate (50ms),
        // and animating bg across multiple rows simultaneously catches the
        // mount transitions of rows entering the viewport, producing flicker.
        // The state read ("which row am I on?") must be instantaneous.
        "hover:bg-muted/50",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        // Left accent bar: snaps instantly with the selection. Tracks the
        // cursor without lag, no transition to overlap across adjacent rows.
        "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:rounded-full before:bg-primary",
        "before:opacity-0 data-[selected=true]:before:opacity-100",
        // Click feedback — rows are buttons; buttons must feel pressable.
        "transition-transform duration-100 active:scale-[0.99] motion-reduce:active:scale-100",
      ].join(" ")}
    >
      {icon && (
        <ItemMedia className="size-5 self-center! text-foreground">{icon}</ItemMedia>
      )}
      <ItemContent className="min-w-0 flex-1 gap-0">
        <ItemTitle className="line-clamp-1 wrap-anywhere text-sm font-normal text-foreground">
          {title}
        </ItemTitle>
        <ItemDescription className="line-clamp-1 wrap-anywhere text-xs font-normal text-muted-foreground">
          {subTitle}
        </ItemDescription>
      </ItemContent>
      {parentLabel && (
        <ItemContent className="flex items-center justify-end">
          <Badge
            variant="outline"
            className="hidden h-5 min-w-5 items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-border px-1.5 font-mono text-xs text-muted-foreground tracking-tight sm:inline-flex"
            title={parentLabel}
          >
            {truncateMiddle(parentLabel, TRUNCATE_MAX)}
          </Badge>
        </ItemContent>
      )}
    </Item>
  );
}

const MenuRow = memo(MenuRowImpl);
MenuRow.displayName = "MenuRow";

export default MenuRow;
