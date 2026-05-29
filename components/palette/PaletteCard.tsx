import React from "react";
import { cn } from "@/lib/utils";

/**
 * The palette's visual chrome: a three-row (header / body / footer) rounded,
 * bordered surface. Extracted so both the live overlay (PaletteShell) and the
 * settings live preview render the exact same card — no duplicated styling to
 * keep in sync. Sizing, shadow, and animation are left to the caller via
 * `className` / spread props, since they differ between the overlay and the
 * inline preview.
 */
const PaletteCard = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative grid grid-rows-[min-content_1fr_min-content]",
        "overflow-hidden rounded-3xl border border-border bg-popover text-popover-foreground",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
);

PaletteCard.displayName = "PaletteCard";

export default PaletteCard;
