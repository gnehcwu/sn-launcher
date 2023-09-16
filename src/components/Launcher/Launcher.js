import React from 'react';
import FocusLock from 'react-focus-lock';
import styled from 'styled-components';

import Filter from '../Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useChromeMessage from '../../hooks/useChromeMessage';
import useLauncherStore from '../../store/launcherStore';
import useLauncherData from '../../hooks/useLauncherData';
import useDisablePageScrolling from '../../hooks/useDisablePageScrolling';
import scoreItems from '../../utils/scoreItems';
import action from '../../utils/action';

const Wrapper = styled.div`
  color-scheme: light;
  all: initial;
  -webkit-text-size-adjust: none;
  accent-color: var(--sn-launcher-brand);
  block-size: 100%;
  caret-color: var(--sn-launcher-brand);

  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  z-index: var(--sn-launcher-layer-important);
  font-family: var(--sn-launcher-font-sans);

  & *,
  & ::after,
  & ::before {
    box-sizing: border-box;
  }

  @media (prefers-reduced-motion: no-preference) {
    scroll-behavior: smooth;
  }

  @media (prefers-color-scheme: dark) {
    color-scheme: dark;
  }
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: var(--sn-launcher-surface-backdrop);
  transition: background-color 600ms ease-in;
`;

const LauncherContainer = styled.div`
  position: relative;
  background-color: var(--sn-launcher-surface-primary);
  border-radius: 12px;
  animation-duration: 125ms;
  width: min(789px, 100vw);
  height: 520px;
  box-shadow: var(--sn-launcher-shadow);

  display: grid;
  grid-template-rows: min-content 1fr min-content;
  font-size: 10px;

  @media (prefers-color-scheme: dark) {
    border: 1px solid var(--sn-launcher-separator);
  }
`;

function Launcher() {
  const [isShown, setIsShown] = React.useState(false);
  const filterRef = React.useRef(null);
  const [
    filter,
    updateFilter,
    commandMode,
    updateCommandMode,
    selected,
    updateSelected,
    token,
    updateIsLoading,
    reset,
  ] = useLauncherStore((state) => [
    state.filter,
    state.updateFilter,
    state.commandMode,
    state.updateCommandMode,
    state.selected,
    state.updateSelected,
    state.token,
    state.updateIsLoading,
    state.reset,
  ]);

  const [allMenus, allScopes, allCommands] = useLauncherData();
  const [items, setItems] = React.useState([]);

  function toggleLauncher() {
    setIsShown(!isShown);
  }

  const dismissLauncher = React.useCallback(() => {
    setIsShown(false);
    reset();
  }, [reset]);

  function handleKeyPress(event) {
    event.stopPropagation();

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
      selectedMenu: items[selected],
      filter,
      updateFilter,
      commandMode,
      updateIsLoading,
    });
  }

  function handleNavigation(event) {
    const isArrowDown = event.key === 'ArrowDown';
    let nextIndex = isArrowDown ? selected + 1 : selected - 1;
    if (nextIndex >= items.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = items.length - 1;
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

  React.useEffect(() => {
    setItems(getRenderItems(filter));
  }, [filter, getRenderItems]);

  useDisablePageScrolling(isShown);

  // Toggle plugin content modal when snl-toggle-launcher message been sent
  useChromeMessage('snl-toggle-launcher', toggleLauncher);

  if (!isShown || !token) return null;

  return (
    <FocusLock returnFocus={true}>
      <Wrapper onKeyDown={handleKeyPress}>
        <Backdrop onClick={dismissLauncher} />
        <LauncherContainer>
          <Filter ref={filterRef} dismissLauncher={dismissLauncher} />
          <MenuList menuList={items} handleClick={handleAction} />
          <Footer />
        </LauncherContainer>
      </Wrapper>
    </FocusLock>
  );
}

export default Launcher;
