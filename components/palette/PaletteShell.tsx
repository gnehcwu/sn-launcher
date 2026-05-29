import React, { useEffect, useState } from "react";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import PaletteCard from "./PaletteCard";

interface PaletteShellProps {
  isShown: boolean;
  onDismiss: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  ariaAnnouncement?: string;
  children: React.ReactNode;
}

const EXIT_DURATION = 120;

function PaletteShell({
  isShown,
  onDismiss,
  onKeyDown,
  ariaAnnouncement,
  children,
}: PaletteShellProps) {
  const [rendered, setRendered] = useState(isShown);
  const [state, setState] = useState<"open" | "closing">(isShown ? "open" : "closing");

  useEffect(() => {
    if (isShown) {
      setRendered(true);
      // next frame so animate-in plays
      requestAnimationFrame(() => setState("open"));
      return;
    }
    setState("closing");
    const timer = setTimeout(() => setRendered(false), EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [isShown]);

  if (!rendered) return null;

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  return (
    <FocusLock>
      <RemoveScroll>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SN Launcher"
          data-state={state}
          className={[
            "fixed inset-0 z-2147483648 grid place-content-center bg-black/25",
            "motion-safe:transition-opacity motion-safe:duration-150",
            "data-[state=open]:opacity-100 data-[state=closing]:opacity-0",
          ].join(" ")}
          onClick={onBackdrop}
        >
          <PaletteCard
            data-state={state}
            onKeyDown={onKeyDown}
            // Suppress the browser's native right-click menu anywhere in the
            // palette — it's a command surface, not page content.
            onContextMenu={(e) => e.preventDefault()}
            className={[
              "w-[min(720px,100vw)]",
              // The palette chrome (header label/badges, list rows, footer) is
              // navigated, not read — suppress text selection across the card.
              // The search input re-enables it (select-text) so the typed query
              // stays editable.
              "select-none",
              "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]",
              "motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-out",
              "data-[state=open]:opacity-100 data-[state=open]:scale-100",
              "data-[state=closing]:opacity-0 data-[state=closing]:scale-[0.985]",
              "focus-within:ring-2 focus-within:ring-ring/30 focus-within:ring-offset-0",
            ].join(" ")}
          >
            {children}
          </PaletteCard>
          <div aria-live="polite" className="sr-only">
            {ariaAnnouncement}
          </div>
        </div>
      </RemoveScroll>
    </FocusLock>
  );
}

export default PaletteShell;
