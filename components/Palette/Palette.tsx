import React, { useEffect, useRef, useState } from "react";
import type { CommandItem } from "@/utils/types";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import scoreItems from "@/utils/scoring/scoreItems";
import useLauncherStore from "@/utils/launcherStore";
import usePaletteData from "@/hooks/usePaletteData";
import useHistory from "@/hooks/useHistory";
import useTable from "@/hooks/useTable";
import useScope from "@/hooks/useScope";
import useChromeMessage from "@/hooks/useChromeMessage";
import MenuList from "@/components/MenuList";
import Filter from "@/components/Filter";
import Footer from "@/components/Footer";
import {
  isCompactLayoutMode,
  isTableMode,
  isHistoryMode,
  isSwitchScopeMode,
  isActionsMode,
} from "@/utils/configs/commands";
import action from "./palette-action";
import { COMMAND_MODES, SN_LAUNCHER_COMMAND_SHORTCUTS } from "@/utils/configs/constants";
import "@/assets/tailwind.css";

function Palette() {
  const { filter, commandMode, token, selected, isShown, updateCommandMode, updateSelected, updateIsLoading, reset } =
    useLauncherStore((state) => ({
      filter: state.filter,
      commandMode: state.commandMode,
      token: state.token,
      selected: state.selected,
      isShown: state.isShown,
      updateCommandMode: state.updateCommandMode,
      updateSelected: state.updateSelected,
      updateIsLoading: state.updateIsLoading,
      reset: state.reset,
    }));

  const totalCount = useRef<number>(0);
  const [currentMenuList, setCurrentMenuList] = useState<CommandItem[]>([]);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const firstTimeShownRef = useRef(true);

  const [menus, commands] = usePaletteData();
  const [tables] = useTable();
  const [histories] = useHistory();
  const [scopes] = useScope();

  const handleNavigation = (event: React.KeyboardEvent) => {
    const total = currentMenuList?.length;

    if (!total) return;

    const isArrowDown = event.key === "ArrowDown";
    const next = ((isArrowDown ? selected + 1 : selected - 1) + total) % total;

    updateSelected(next);
  };

  const handleKeydown = (event: React.KeyboardEvent) => {
    event.stopPropagation();

    const { key } = event;
    switch (key) {
      case "ArrowUp":
      case "ArrowDown":
        event.preventDefault();
        handleNavigation(event);
        break;
      case "Escape":
        reset();
        break;
      case "Enter":
        executeAction();
        break;
      case "Backspace":
        if (!filter && commandMode) {
          updateCommandMode("");
        }
        break;
      case "Tab":
        event.preventDefault();
        if (commandMode) {
          updateCommandMode("");
        } else {
          updateCommandMode(COMMAND_MODES.ACTIONS);
        }
        break;
    }
  };

  const executeAction = () => {
    action({
      selectedMenu: currentMenuList[selected],
      filter,
      commandMode,
      reset,
      updateCommandMode,
      updateIsLoading,
    });
  };

  const dismiss = (evt: React.MouseEvent) => {
    if (evt.target === evt.currentTarget) {
      reset(false);
      setAnimationTrigger(0);
    }
  };

  // Register extension command shortcuts
  Object.entries(SN_LAUNCHER_COMMAND_SHORTCUTS).forEach(([shortcut, { commandMode }]) => {
    useChromeMessage(shortcut, () => {
      const newIsShow = !isShown;
      reset(newIsShow);

      if (newIsShow) {
        if (commandMode) {
          updateCommandMode(commandMode);
          setAnimationTrigger(-1);
        } else {
          setAnimationTrigger(0);
        }

        firstTimeShownRef.current = false;
      } else {
        setAnimationTrigger(0);
      }
    });
  });

  useEffect(() => {
    try {
      const getFilteredMenus = () => {
        const sourceList = isActionsMode(commandMode)
          ? commands
          : isSwitchScopeMode(commandMode)
          ? scopes
          : isTableMode(commandMode)
          ? tables
          : isHistoryMode(commandMode)
          ? histories
          : commandMode
          ? []
          : menus;
        totalCount.current = sourceList.length;
        return scoreItems(sourceList, filter);
      };

      setCurrentMenuList(getFilteredMenus());
    } catch (_) {
      setCurrentMenuList([]);
    }
  }, [commandMode, filter, commands, scopes, tables, histories, menus]);

  useEffect(() => {
    setAnimationTrigger((prev) => prev + 1);
  }, [commandMode]);

  // Avoid rendering the launcher if there is no valid token
  if (!token || !isShown) return null;

  const isCompact = isCompactLayoutMode(commandMode);

  return (
    <FocusLock>
      <RemoveScroll>
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/20 grid place-content-center animate-in fade-in duration-150 z-2147483648"
          onClick={dismiss}
        >
          <div
            className="border border-neutral-300 dark:border-neutral-600 relative bg-white dark:bg-black rounded-2xl shadow-2xl w-[min(789px,100vw)] grid grid-rows-[min-content_1fr_min-content] animate-in zoom-in-95 duration-125"
            onKeyDown={handleKeydown}
            key={animationTrigger}
            data-animate={animationTrigger > 0 ? "true" : "false"}
          >
            <Filter />
            {!isCompact && (
              <>
                <MenuList menuList={currentMenuList} onAction={executeAction} />
                <Footer filteredCount={currentMenuList.length} totalCount={totalCount.current} />
              </>
            )}
          </div>
        </div>
      </RemoveScroll>
    </FocusLock>
  );
}

export default Palette;
