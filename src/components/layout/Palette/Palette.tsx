import React, { useEffect, useRef, useState } from 'react';
import type { CommandItem } from '../../../types';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';
import useChromeMessage from '../../../hooks/useChromeMessage';
import scoreItems from '../../../utilities/scoring/scoreItems';
import useLauncherStore from '../../../store/launcherStore';
import { useLauncherData, useHistory, useTable, useScope } from '../../../hooks';
import { Filter, MenuList, Footer } from '../../common';
import {
  isCompactLayoutMode,
  isTableMode,
  isHistoryMode,
  isSwitchScopeMode,
  isActionsMode,
} from '../../../utilities/configs/commands';
import action from './action';
import { COMMAND_MODES, SN_LAUNCHER_COMMAND_SHORTCUTS } from '../../../utilities/configs/constants';
import { PaletteContainer, Launcher } from './Palette.styles';

function Palette() {
  const filter = useLauncherStore((state) => state.filter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const token = useLauncherStore((state) => state.token);
  const selected = useLauncherStore((state) => state.selected);
  const isShown = useLauncherStore((state) => state.isShown);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const reset = useLauncherStore((state) => state.reset);

  const totalCount = useRef<number>(0);
  const [shouldAttractAttention, setShouldAttractAttention] = useState(false);
  const [isInitialShow, setIsInitialShow] = useState(true);
  const [currentMenuList, setCurrentMenuList] = useState<CommandItem[]>([]);

  const [menus, commands] = useLauncherData();
  const [tables] = useTable();
  const [histories] = useHistory();
  const [scopes] = useScope();

  const handleKeydown = (event: React.KeyboardEvent) => {
    event.stopPropagation();

    const { key } = event;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleNavigation(event);
        break;
      case 'Escape':
        reset();
        break;
      case 'Enter':
        handleAction();
        break;
      case 'Backspace':
        if (!filter && commandMode) {
          updateCommandMode('');
        }
        break;
      case 'Tab':
        event.preventDefault();
        if (!commandMode) {
          updateCommandMode(COMMAND_MODES.ACTIONS);
        }
        break;
    }
  };

  const handleAction = () => {
    action({
      selectedMenu: currentMenuList[selected],
      filter,
      commandMode,
      reset,
      updateCommandMode,
      updateIsLoading,
    });
  };

  const handleNavigation = (event: React.KeyboardEvent) => {
    const isArrowDown = event.key === 'ArrowDown';
    const nextIndex = ((isArrowDown ? selected + 1 : selected - 1) + currentMenuList.length) % currentMenuList.length;
    updateSelected(nextIndex);
  };

  const handleClick = (evt: React.MouseEvent) => {
    if (evt.target === evt.currentTarget) {
      reset(false);
    }
  };

  
  // Register extension command shortcuts
  Object.entries(SN_LAUNCHER_COMMAND_SHORTCUTS).forEach(([shortcut, { commandMode }]) => {
    useChromeMessage(shortcut, () => {
      reset(!isShown);
      if (commandMode) updateCommandMode(commandMode);
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
    if (commandMode && !isInitialShow) {
      setShouldAttractAttention(true);
      const timer = setTimeout(() => setShouldAttractAttention(false), 175);

      return () => clearTimeout(timer);
    }
  }, [commandMode, isInitialShow]);

  useEffect(() => {
    if (isShown) {
      // Reset transition state whenever launcher is shown
      setIsInitialShow(true);
      const timer = setTimeout(() => setIsInitialShow(false), 125);

      return () => clearTimeout(timer);
    }
  }, [isShown]);

  // Avoid rendering the launcher if there is no valid token
  if (!token) return null;

  const isCompact = isCompactLayoutMode(commandMode);

  return (
    isShown && (
      <FocusLock>
        <RemoveScroll>
          <Launcher onClick={handleClick}>
            <PaletteContainer
              $shouldAttractAttention={shouldAttractAttention}
              $isCompact={isCompact}
              $isInitialShow={isInitialShow}
              onKeyDown={handleKeydown}
            >
              <Filter />
              {!isCompact && (
                <>
                  <MenuList menuList={currentMenuList} onClick={handleAction} />
                  <Footer currentCount={currentMenuList.length} totalCount={totalCount.current} />
                </>
              )}
            </PaletteContainer>
          </Launcher>
        </RemoveScroll>
      </FocusLock>
    )
  );
}

export default Palette;
