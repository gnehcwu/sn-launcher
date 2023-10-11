import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Filter from '../Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useLauncherStore from '../../store/launcherStore';
import action from './action';
import { isCompactMode, COMMAND_MODES } from '../../configs/commands';

Palette.propTypes = {
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
    }),
  ),
};

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
 * Renders the Launcher palette component.
 *
 * @param {Object} _ - Props object (unused).
 * @param {Object} ref - Ref object for the component.
 * @returns {JSX.Element} The Launcher palette component.
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

  function handleKeyPress(event) {
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
    if (nextIndex >= menus.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = menus.length - 1;
    }

    updateSelected(nextIndex);
  }

  React.useEffect(() => {
    if (commandMode) {
      setShouldAnimate(true);
    }
  }, [commandMode]);

  const isCompact = isCompactMode(commandMode);

  return (
    <PaletteContainer
      key={commandMode}
      $shouldAnimate={shouldAnimate}
      $isCompact={isCompact}
      onKeyDown={handleKeyPress}
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
