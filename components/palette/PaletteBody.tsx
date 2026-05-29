import { useCallback, useEffect, useState } from "react";
import { List, useListRef, RowComponentProps } from "react-window";
import useLauncherStore from "@/utils/launcherStore";
import { LOADER_DEFER_TIME } from "@/utils/configs/constants";
import type { CommandItem } from "@/utils/types";
import MenuRow from "./MenuRow";
import { EmptyState, LoadingState, ErrorState } from "./states";

interface PaletteBodyProps {
  menuList: CommandItem[];
  onAction: () => void;
  onRetry?: () => void;
}

const ROW_HEIGHT = 50;
// 7 rows × 50px. Reduced from 400 (8 rows) to make the palette a touch shorter.
const LIST_HEIGHT = 350;

interface RowComponentExtraProps {
  menuList: CommandItem[];
  selected: number;
  onAction: () => void;
  onSelect: (index: number) => void;
}

function VirtualRow({
  index,
  style,
  menuList,
  selected,
  onAction,
  onSelect,
}: RowComponentProps<RowComponentExtraProps>) {
  return (
    <MenuRow
      index={index}
      item={menuList[index]}
      active={index === selected}
      onSelect={onSelect}
      onAction={onAction}
      style={style}
    />
  );
}

function PaletteBody({ menuList, onAction, onRetry }: PaletteBodyProps) {
  const isLoading = useLauncherStore((state) => state.isLoading);
  const selected = useLauncherStore((state) => state.selected);
  const setSelected = useLauncherStore((state) => state.setSelected);
  const error = useLauncherStore((state) => state.error);
  const listRef = useListRef(null);
  const [isDeferredLoading, setIsDeferredLoading] = useState(true);

  const handleSelect = useCallback(
    (index: number) => {
      setSelected(index);
    },
    [setSelected]
  );

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsDeferredLoading(false), LOADER_DEFER_TIME);
      return () => clearTimeout(timer);
    }
    setIsDeferredLoading(true);
  }, [isLoading]);

  // Smooth scroll only when the target row is actually off-screen — in-view
  // moves don't need an animation, and scrolling toward an already-visible
  // row caused the highlight to appear to "jump" mid-animation.
  useEffect(() => {
    listRef.current?.scrollToRow({
      index: selected,
      behavior: "instant",
      align: "auto",
    });
  }, [selected, listRef]);

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if ((isLoading || isDeferredLoading) && !menuList?.length) {
    return <LoadingState />;
  }

  if (!menuList?.length) {
    return <EmptyState />;
  }

  return (
    <div
      id="snl-listbox"
      role="listbox"
      aria-label="Commands"
      aria-busy={isLoading}
      className="px-3 py-2"
    >
      <List
        listRef={listRef}
        rowCount={menuList.length}
        rowHeight={ROW_HEIGHT}
        rowProps={{ menuList, selected, onAction, onSelect: handleSelect }}
        // Pre-mount a generous buffer beyond the viewport so rows entering
        // via keyboard nav are always painted in their final selection state
        // before they become visible — no mid-scroll mount artifacts.
        overscanCount={5}
        className="w-full overscroll-contain scrollbar-hide outline-none focus:outline-none focus-visible:outline-none"
        style={{ height: LIST_HEIGHT }}
        rowComponent={VirtualRow}
      />
    </div>
  );
}

export default PaletteBody;
