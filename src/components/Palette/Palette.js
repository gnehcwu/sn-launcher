import React from 'react';
import styled from 'styled-components';

import Filter from '../Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useLauncherStore from '../../store/launcherStore';
import useLauncherData from '../../hooks/useLauncherData';
import scoreItems from '../../utils/scoreItems';
import action from '../../utils/action';

const PaletteContainer = styled.div`
  position: relative;
  background-color: var(--sn-launcher-surface-primary);
  width: min(789px, 100vw);
  height: 520px;
  border-radius: 12px;
  display: grid;
  grid-template-rows: min-content 1fr min-content;
  box-shadow: var(--sn-launcher-shadow);
  font-size: 10px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (prefers-color-scheme: dark) {
    border: 1px solid var(--sn-launcher-separator);
  }
`;

function Palette(_, ref) {
  const filterRef = React.useRef(null);
  const filter = useLauncherStore((state) => state.filter);
  const updateFilter = useLauncherStore((state) => state.updateFilter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const updateStamp = useLauncherStore((state) => state.updateStamp);
  const reset = useLauncherStore((state) => state.reset);

  const [allMenus, allScopes, allCommands] = useLauncherData();
  const items = React.useRef([]);

  const dismissLauncher = React.useCallback(() => {
    reset();
  }, [reset]);

  function handleKeyPress(event) {
    const { key } = event;
    if (['ArrowUp', 'ArrowDown'].includes(key)) {
      // Stop cursor moving inside filter input
      event.preventDefault();
      handleNavigation(event);
    } else if (key === 'Escape') {
      dismissLauncher();
    } else if (key === 'Enter') {
      handleAction();
      filterRef?.current?.focus();
    } else if (key === 'Backspace') {
      if (!filter && commandMode) {
        updateCommandMode('');
      }
    }
  }

  function handleAction() {
    action({
      dismissLauncher,
      updateCommandMode,
      selectedMenu: items.current[selected],
      filter,
      updateFilter,
      commandMode,
      updateIsLoading,
      updateStamp,
    });
  }

  function handleNavigation(event) {
    const isArrowDown = event.key === 'ArrowDown';
    let nextIndex = isArrowDown ? selected + 1 : selected - 1;
    if (nextIndex >= items.current.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = items.current.length - 1;
    }

    updateSelected(nextIndex);
  }

  const getRenderItems = React.useCallback(
    (filter) => {
      const commandPattern = filter.match(/^>s*(.*)/);
      if (commandPattern) {
        return scoreItems(allCommands, commandPattern[1]);
      } else if (commandMode && commandMode === 'switch_app') {
        return scoreItems(allScopes, filter);
      } else if (commandMode) {
        return [];
      } else {
        return scoreItems(allMenus, filter);
      }
    },
    [allCommands, allMenus, allScopes, commandMode],
  );

  items.current = getRenderItems(filter);

  return (
    <PaletteContainer onKeyDown={handleKeyPress} ref={ref}>
      <Filter ref={filterRef} />
      <MenuList menuList={items.current} handleClick={handleAction} />
      <Footer />
    </PaletteContainer>
  );
}

export default React.forwardRef(Palette);
