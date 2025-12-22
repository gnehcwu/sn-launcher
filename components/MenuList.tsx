import { useEffect, useState } from "react";
import { List, useListRef, RowComponentProps } from "react-window";
import useLauncherStore from "@/utils/launcherStore";
import { LOADER_DEFER_TIME } from "@/utils/configs/constants";
import type { CommandItem } from "@/utils/types";
import { Empty, EmptyHeader, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemTitle, ItemContent, ItemMedia, ItemDescription } from "@/components/ui/item";
import { Skeleton } from "./ui/skeleton";
import { Shell } from "lucide-react";
import "@/assets/tailwind.css";

interface MenuListProps {
  menuList: CommandItem[];
  onAction: () => void;
}

const SKELETON_COUNT = 8;
const SKELETON_WIDTHS = Array.from({ length: SKELETON_COUNT }, (_, i) => ({
  title: 40 + ((i * 17 + 7) % 36),
  subtitle: 25 + ((i * 13 + 11) % 31),
}));

function EmptyState() {
  return (
    <Empty className="font-mono h-[416px]">
      <EmptyHeader>
        <EmptyMedia variant="default" className="text-3xl dark:text-neutral-400 text-neutral-500">
          <Shell size={48} className="text-neutral-700 dark:text-neutral-300" />
        </EmptyMedia>
        <EmptyTitle className="text-neutral-700 dark:text-neutral-300">No results found</EmptyTitle>
        <EmptyDescription className="text-neutral-700 dark:text-neutral-300">
          Try again with a different search term
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col justify-between h-[416px] py-2 px-3">
      {SKELETON_WIDTHS.map(({ title, subtitle }) => (
        <Item role="listitem" size="sm" className="w-full h-[50px] p-1!">
          <ItemContent className="flex-1 flex flex-col content-center h-full gap-0 gap-y-2! justify-center">
            <ItemTitle className="w-full">
              <Skeleton className="h-[13px]" style={{ width: `${title}%` }} />
            </ItemTitle>
            <ItemDescription className="w-full">
              <Skeleton className="h-[9px]" style={{ width: `${subtitle}%` }} />
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}

function MenuList({ menuList, onAction }: MenuListProps) {
  const isLoading = useLauncherStore((state) => state.isLoading);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const listRef = useListRef(null);
  const [isDeferredLoading, setIsDeferredLoading] = useState(true);

  const handleSelectChange = (index: number) => {
    if (index === selected) return;

    updateSelected(index);
  };

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsDeferredLoading(false);
      }, LOADER_DEFER_TIME);

      return () => clearTimeout(timer);
    } else {
      setIsDeferredLoading(true);
    }
  }, [isLoading]);

  useEffect(() => {
    listRef.current?.scrollToRow({ index: selected, behavior: "instant", align: "auto" });
  }, [selected]);

  const Row = ({ index, style, menuList }: RowComponentProps<{ menuList: CommandItem[] }>) => {
    const item = menuList?.[index];

    if (!item) return <div style={style}>No data</div>;

    const { icon, label, fullLabel, subLabel, target, description } = item;
    const title = fullLabel ?? label;
    const subTitle = subLabel || (target ? target.split("?")[0] : description);
    const active = index === selected;

    return (
      <Item
        role="listitem"
        onMouseMove={() => handleSelectChange(index)}
        onClick={onAction}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        style={style}
        className={`p-[4px_8px] gap-0 gap-x-3 font-mono cursor-default ${active ? "bg-muted/90 dark:bg-muted/80" : ""}`}
      >
        {icon && <ItemMedia className="size-5 self-center! dark:text-neutral-200 text-neutral-950">{icon}</ItemMedia>}
        <ItemContent className="gap-0 flex-1 min-w-0">
          <ItemTitle className="font-normal text-sm line-clamp-1 wrap-anywhere dark:text-neutral-200 text-neutral-950">
            {title}
          </ItemTitle>
          <ItemDescription className="font-normal text-xs line-clamp-1 wrap-anywhere text-neutral-500 dark:text-neutral-400">
            {subTitle}
          </ItemDescription>
        </ItemContent>
      </Item>
    );
  };

  if ((isLoading || isDeferredLoading) && !menuList?.length) {
    return <LoadingState />;
  }

  if (!menuList?.length) {
    return <EmptyState />;
  }

  return (
    <div className="py-2 px-3">
      <List
        listRef={listRef}
        rowCount={menuList.length}
        rowHeight={50}
        rowProps={{ menuList }}
        className="overscroll-contain scrollbar-hide h-[400px] w-full"
        rowComponent={Row}
      />
    </div>
  );
}

export default MenuList;
