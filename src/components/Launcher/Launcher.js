import React from 'react';
import styled from 'styled-components';
import scoreItems from '../../utils/scoreItems';
import { isActionsMode, isSwitchAppMode, isHistoryMode } from '../../configs/commands';
import useLauncherData from '../../hooks/useLauncherData';
import useHistory from '../../hooks/useHistory';
import useChromeMessage from '../../hooks/useChromeMessage';
import useLauncherStore from '../../store/launcherStore';
import * as Dialog from '@radix-ui/react-dialog';
import Palette from '../Palette/Palette';

const Wrapper = styled.div`
  color-scheme: light;
  all: initial;
  -webkit-text-size-adjust: none;

  position: fixed;
  inset: 0;
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
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

function Launcher() {
  const [container, setContainer] = React.useState(null);
  const isShown = useLauncherStore((state) => state.isShown);
  const reset = useLauncherStore((state) => state.reset);
  const token = useLauncherStore((state) => state.token);
  const filter = useLauncherStore((state) => state.filter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const [allMenus, allScopes, allCommands] = useLauncherData();
  const [histories, clearHistories] = useHistory();
  const availableMenusRef = React.useRef([]);

  function toggleLauncher() {
    reset(!isShown);
  }

  const getRenderItems = (filter) => {
    try {
      if (isActionsMode(commandMode)) {
        return scoreItems(allCommands, filter);
      } else if (isSwitchAppMode(commandMode)) {
        return scoreItems(allScopes, filter);
      } else if (isHistoryMode(commandMode)) {
        return scoreItems(histories, filter);
      } else if (commandMode) {
        return [];
      } else {
        return scoreItems(allMenus, filter);
      }
    } catch (_) {
      /* ignore */
    }
  };

  // Listen to the toggle launcher message
  useChromeMessage('snl-toggle-launcher', toggleLauncher);

  React.useEffect(() => {
    if (!isHistoryMode(commandMode)) {
      clearHistories();
    }
  }, [clearHistories, commandMode]);

  if (!token) return null;

  availableMenusRef.current = getRenderItems(filter);

  return (
    <>
      {isShown && <Wrapper ref={setContainer} />}
      <Dialog.Root open={isShown} modal={false}>
        <Dialog.Portal container={container}>
          <Backdrop onClick={toggleLauncher} />
          <Dialog.Content asChild={true} onPointerDownOutside={(event) => event.preventDefault()}>
            <Palette menus={availableMenusRef.current} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default Launcher;
