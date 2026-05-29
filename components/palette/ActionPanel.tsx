import { useEffect, useRef, useState } from "react";
import { Kbd } from "@/components/ui/kbd";
import type { SubAction } from "./sub-actions";

// Inline-SVG checkmark whose polyline draws itself via stroke-dashoffset.
// Owned here (not lucide-react) so we can control dash length and stroke
// width independently. The path "20 6 → 9 17 → 4 12" has total length
// ≈22.63; 23 is the tightest round number that still fully clears.
const CHECK_PATH_LENGTH = 23;

interface AnimatedCheckProps {
  size?: number;
  // Toggle false → true to trigger the draw. When false, the line is hidden.
  drawing: boolean;
}
function AnimatedCheck({ size = 16, drawing }: AnimatedCheckProps) {
  // Reduced-motion users get the check instantly — the draw is decorative.
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Once drawn, the polyline stays at dashoffset 0 and fades via opacity on
  // exit. Snapping dashoffset back to 23 in the same render would leave an
  // empty container visible during the parent's 220ms fade — visible when
  // the user clicks a second copy action before the first one finishes.
  const [hasBeenDrawn, setHasBeenDrawn] = useState(false);
  useEffect(() => {
    if (drawing) setHasBeenDrawn(true);
  }, [drawing]);
  const dashoffset =
    reducedMotion || drawing || hasBeenDrawn ? 0 : CHECK_PATH_LENGTH;
  const opacity = !drawing && hasBeenDrawn ? 0 : 1;
  // Two beats: stroke draws on enter (240ms breath after the container's
  // 220ms scale-in, then 380ms visible draw); opacity fades on exit
  // (matching the parent's 220ms). Pure ease-out — stroke and opacity are
  // both entering/leaving, not morphing. The stroke draw IS the
  // celebration: earlier iterations layered a halo/glow on top but it read
  // as a separate "blink" disconnected from the check.
  const transition = reducedMotion
    ? "none"
    : drawing
      ? "stroke-dashoffset 380ms cubic-bezier(0.23, 1, 0.32, 1) 240ms"
      : hasBeenDrawn
        ? "opacity 220ms cubic-bezier(0.23, 1, 0.32, 1)"
        : "none";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      // Slightly thicker than the row's other 2px icons — the extra weight
      // is what makes a 380ms draw read as motion at 16px. Intentional
      // visual asymmetry; this icon is the focal celebration moment.
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Point order = stroke draw direction when dashoffset decreases.
          Reversed from lucide's "20 6 9 17 4 12" so the pen moves
          naturally: short tail (4,12) → corner (9,17) → long arm (20,6). */}
      <polyline
        points="4 12 9 17 20 6"
        style={{
          strokeDasharray: CHECK_PATH_LENGTH,
          strokeDashoffset: dashoffset,
          opacity,
          transition,
        }}
      />
    </svg>
  );
}

interface ActionPanelProps {
  itemLabel: string;
  actions: SubAction[];
  selected: number;
  // Key of the action currently displaying its `feedback` state (e.g. "Copied").
  // Null means no row is in feedback mode.
  feedbackKey?: string | null;
  // Key of the action currently in its programmatic press beat — fires on
  // both Enter and click so keyboard users get a visible acknowledgment.
  pressedKey?: string | null;
  onSelect: (index: number) => void;
  onRun: (action: SubAction) => void;
  onDismiss: () => void;
}

// Strong custom ease-out, cohesive with the rest of the page. Used for
// every transition in this component so the panel speaks one motion language.
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function ActionPanel({
  itemLabel,
  actions,
  selected,
  feedbackKey = null,
  pressedKey = null,
  onSelect,
  onRun,
  onDismiss,
}: ActionPanelProps) {
  // Programmatically focus the active row so FocusLock releases the palette
  // input — without this, calling .blur() on the input would just bounce back.
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeButtonRef.current?.focus({ preventScroll: true });
  }, [selected]);

  return (
    <>
      {/* Invisible click-catcher: closes the panel on any click outside it,
          without dimming the underlying palette. */}
      <div
        onMouseDown={onDismiss}
        aria-hidden="true"
        className="absolute inset-0 z-[5]"
      />
      <div
        role="menu"
        aria-label={`Actions for ${itemLabel}`}
        // Origin matches anchor point (bottom-right ⌘K hint) so the scale-in
        // animation grows from where the user's eye is.
        style={{ transformOrigin: "bottom right", animationTimingFunction: EASE_OUT }}
        className={[
          "absolute bottom-[44px] right-[10px] z-10 w-[260px]",
          "overflow-hidden rounded-xl border border-border/70 bg-popover text-popover-foreground",
          "shadow-[0_22px_48px_-14px_rgba(0,0,0,0.45),0_4px_12px_-6px_rgba(0,0,0,0.25)]",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-150",
        ].join(" ")}
      >
        <div className="border-b border-border/60 px-4 py-3">
          <span className="line-clamp-1 font-mono text-xs text-muted-foreground">
            {itemLabel}
          </span>
        </div>
        <ul className="flex flex-col gap-y-0.5 p-2">
          {actions.map((action, i) => {
            const active = i === selected;
            const showingFeedback = !!action.feedback && feedbackKey === action.key;
            const pressed = pressedKey === action.key;
            return (
              <li key={action.key}>
                <button
                  ref={active ? activeButtonRef : undefined}
                  type="button"
                  role="menuitem"
                  data-active={active ? "true" : "false"}
                  // tabIndex -1 keeps tab order owned by the palette input;
                  // we focus the active row imperatively for FocusLock release.
                  tabIndex={-1}
                  onMouseMove={() => onSelect(i)}
                  onClick={() => onRun(action)}
                  // Inline transform on press — guarantees override of any
                  // CSS scale utility regardless of Tailwind's source order;
                  // the existing transition class still animates it.
                  style={pressed ? { transform: "scale(0.96)" } : undefined}
                  className={[
                    // h-9 fixes the row height so every child centers against
                    // the same axis, regardless of its own intrinsic height.
                    "flex h-9 w-full cursor-default items-center rounded-md px-3",
                    "text-left font-mono text-sm",
                    "outline-none focus:outline-none focus-visible:outline-none",
                    "transition-[transform,background-color,color] duration-150 ease-out",
                    "active:scale-[0.985] motion-reduce:active:scale-100",
                    // Press: dim the accent bg so the row reads as "depressed"
                    // even when the scale is barely perceptible (4%). Active
                    // rows lose their full accent; the bg-accent override
                    // below is gated on !pressed so it doesn't fight.
                    pressed
                      ? "bg-accent/75 text-accent-foreground motion-reduce:bg-accent"
                      : active
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted/50",
                  ].join(" ")}
                >
                  {/* Action identity stays stable across the success moment:
                      icon and label don't swap. Confirmation appears in the
                      right slot. Left = WHAT, right = STATUS. */}
                  <div className="flex min-w-0 flex-1 items-center gap-x-2">
                    {action.icon && (
                      <span
                        className={[
                          "inline-flex h-4 w-4 shrink-0 items-center justify-center self-center",
                          active ? "text-accent-foreground" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {action.icon}
                      </span>
                    )}
                    <span className="truncate leading-none">{action.label}</span>
                  </div>

                  {/* Right slot — grid stacks shortcut hint and success
                      Check in the same cell so the swap is purely
                      opacity/scale, no layout shift. */}
                  {(action.shortcut || action.feedback) && (
                    <span className="ml-3 grid self-center">
                      {action.shortcut && (
                        <Kbd className="col-start-1 row-start-1 self-center px-1 py-px text-xs">
                          {action.shortcut}
                        </Kbd>
                      )}
                      {action.feedback && (
                        <span
                          aria-hidden="true"
                          style={{ transitionTimingFunction: EASE_OUT }}
                          className={[
                            "col-start-1 row-start-1 inline-flex items-center justify-center self-center",
                            "text-foreground",
                            // 220ms sits in the state-change band; 0.6 → 1 is
                            // dramatic enough to feel decisive without bouncing.
                            "transition-[opacity,transform] duration-[220ms] motion-reduce:transition-none",
                            showingFeedback ? "opacity-100 scale-100" : "opacity-0 scale-[0.6]",
                          ].join(" ")}
                        >
                          <AnimatedCheck drawing={showingFeedback} />
                        </span>
                      )}
                    </span>
                  )}

                  {/* Persistent live region: announces the spoken confirmation
                      ("Copied") to assistive tech. Stays mounted so the live
                      update is actually noticed. */}
                  {action.feedback && (
                    <span className="sr-only" aria-live="polite">
                      {showingFeedback ? action.feedback.label : ""}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default ActionPanel;
