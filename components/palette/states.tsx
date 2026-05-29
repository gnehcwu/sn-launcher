import { SearchX, AlertCircle } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import type { LauncherError } from "@/utils/types";

// Must equal PaletteBody's loaded body height so the empty / error / loading
// states don't shift on transition: LIST_HEIGHT (350 = 7 × 50px rows) + the
// list wrapper's py-2 (16px) = 366px.
const BODY_HEIGHT_CLASS = "h-[366px]";

export function EmptyState() {
  return (
    <Empty className={`${BODY_HEIGHT_CLASS} border-0 p-0`}>
      <EmptyHeader>
        <EmptyMedia variant="default" className="text-muted-foreground/70">
          <SearchX size={44} strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle className="font-medium text-foreground">No results</EmptyTitle>
        <EmptyDescription className="text-muted-foreground">
          Try a different search
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function ErrorState({ error, onRetry }: { error: LauncherError; onRetry?: () => void }) {
  return (
    <Empty className={`${BODY_HEIGHT_CLASS} border-0 p-0`}>
      <EmptyHeader>
        <EmptyMedia variant="default" className="text-destructive/80">
          <AlertCircle size={44} strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle className="font-medium text-foreground">
          {error.kind === "auth"
            ? "Session expired"
            : error.kind === "network"
            ? "Network error"
            : error.kind === "schema"
            ? "Unexpected response"
            : "Something went wrong"}
        </EmptyTitle>
        <EmptyDescription className="text-muted-foreground">{error.message}</EmptyDescription>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center justify-center rounded-md border border-border bg-transparent px-3 py-1 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            Try again
          </button>
        )}
      </EmptyHeader>
    </Empty>
  );
}

const SKELETON_COUNT = 7;
const SKELETON_WIDTHS = Array.from({ length: SKELETON_COUNT }, (_, i) => ({
  title: 40 + ((i * 17 + 7) % 36),
  subtitle: 25 + ((i * 13 + 11) % 31),
  delay: i * 40,
}));

export function LoadingState() {
  return (
    <div className={`${BODY_HEIGHT_CLASS} flex flex-col px-3 py-2`} aria-busy="true" aria-live="polite">
      {SKELETON_WIDTHS.map(({ title, subtitle, delay }, idx) => (
        <Item
          key={idx}
          role="presentation"
          size="sm"
          className="h-[50px] gap-0 gap-x-3 p-[4px_8px] items-center"
        >
          <ItemContent className="gap-2">
            <ItemTitle className="w-full">
              <Skeleton
                className="h-[12px] motion-safe:animate-pulse motion-reduce:animate-none"
                style={{ width: `${title}%`, animationDelay: `${delay}ms` }}
              />
            </ItemTitle>
            <ItemDescription className="w-full">
              <Skeleton
                className="h-[9px] motion-safe:animate-pulse motion-reduce:animate-none"
                style={{ width: `${subtitle}%`, animationDelay: `${delay + 20}ms` }}
              />
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}
