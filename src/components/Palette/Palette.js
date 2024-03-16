import React from 'react';
import styled from 'styled-components';

import Filter from '../Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useLauncherStore from '../../store/launcherStore';
import action from './action';
import { isCompactMode, COMMAND_MODES } from '../../configs/commands';

const PaletteContainer = styled.div`
  --content-show: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --scale: scaleAnimation 175ms ease-in-out;

  position: relative;
  left: calc(50vw - 384px);
  top: calc(50vh - 236px);
  background-color: var(--sn-launcher-surface-primary);
  width: min(768px, 100vw);
  height: ${(props) => (props.$isCompact ? 'auto' : '472px')};
  border-radius: 14px;
  display: grid;
  grid-template-rows: min-content 1fr min-content;
  box-shadow: var(--sn-launcher-shadow);
  border: 1px solid var(--sn-launcher-text-info);
  transform-origin: center center;
  font-size: 10px;
  ${(props) => props.$shouldAnimate && 'animation: var(--scale)'};

  &:focus {
    outline: none;
  }

  @keyframes scaleAnimation {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.99);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (prefers-color-scheme: dark) {
    border: 1px solid var(--sn-launcher-text-info);
  }
`;

/**
 * A component that displays a palette of menus and allows the user to filter and select them.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.menus - An array of menu objects to display in the palette.
 * @param {React.Ref} ref - A ref to attach to the component's root element.
 * @returns {JSX.Element} The JSX element representing the palette.
 */
function Palette({ menus }, ref) {
  const filter = useLauncherStore((state) => state.filter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const updateCommandMode = useLauncherStore((state) => state.updateCommandMode);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const updateIsLoading = useLauncherStore((state) => state.updateIsLoading);
  const reset = useLauncherStore((state) => state.reset);

  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  function handleKeydown(event) {
    event.stopPropagation();

    const { key } = event;
    if (['ArrowUp', 'ArrowDown'].includes(key)) {
      // Stop cursor moving inside filter input
      event.preventDefault();
      handleNavigation(event);
    } else if (key === 'Escape') {
      reset();
    } else if (key === 'Enter') {
      handleAction();
    } else if (key === 'Backspace') {
      if (!filter && commandMode) {
        updateCommandMode('');
      }
    } else if (key === 'Tab') {
      // Trap the focus inside the palette
      event.preventDefault();

      if (!commandMode) {
        updateCommandMode(COMMAND_MODES.ACTIONS);
      }
    }
  }

  function handleAction() {
    action({
      selectedMenu: menus[selected],
      filter,
      commandMode,
      reset,
      updateCommandMode,
      updateIsLoading,
    });
  }

  function handleNavigation(event) {
    const isArrowDown = event.key === 'ArrowDown';
    let nextIndex = isArrowDown ? selected + 1 : selected - 1;
    // Calibrate index to loop around
    nextIndex = (nextIndex + menus.length) % menus.length;

    updateSelected(nextIndex);
  }

  React.useEffect(() => {
    commandMode && setShouldAnimate(true);
  }, [commandMode]);

  const isCompact = isCompactMode(commandMode);

  return (
    <PaletteContainer
      key={commandMode}
      $shouldAnimate={shouldAnimate}
      $isCompact={isCompact}
      onKeyDown={handleKeydown}
      ref={ref}
    >
      <Filter />
      {isCompact ? null : (
        <>
          <MenuList menuList={menus} handleClick={handleAction} />
          <Footer />
        </>
      )}
    </PaletteContainer>
  );
}

export default React.forwardRef(Palette);
