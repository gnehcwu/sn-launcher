import React from 'react';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import useChromeMessage from '../../hooks/useChromeMessage';
import useLauncherStore from '../../store/launcherStore';
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
  background-color: var(--sn-launcher-surface-backdrop);
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

  function toggleLauncher() {
    reset(!isShown);
  }

  // Toggle plugin content modal when snl-toggle-launcher message been sent
  useChromeMessage('snl-toggle-launcher', toggleLauncher);

  if (!isShown || !token) return null;

  return (
    <>
      <Wrapper ref={setContainer} />
      <Dialog.Root open={isShown} modal={false}>
        <Dialog.Portal container={container}>
          <Backdrop onClick={toggleLauncher} />
          <Dialog.Content asChild={true} onPointerDownOutside={(event) => event.preventDefault()}>
            <Palette />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default Launcher;
