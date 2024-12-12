import styled from 'styled-components';

export const Launcher = styled.div`
  color-scheme: light;
  all: initial;
  -webkit-text-size-adjust: none;
  font-family: var(--sn-launcher-font-sans);
  position: fixed;
  inset: 0;
  z-index: var(--sn-launcher-layer-important);
  background-color: rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    display: grid;
    place-content: center;
  }

  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

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

interface PaletteContainerProps {
  $isCompact: boolean;
  $shouldAttractAttention: boolean;
  $isInitialShow: boolean;
}

export const PaletteContainer = styled.div<PaletteContainerProps>`
  @media (min-width: 768px) {
    position: absolute;
    left: calc(50vw - 384px);
    top: calc(50vh - 236px);
  }

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

  --scale: scale 175ms cubic-bezier(0.16, 1, 0.3, 1);
  --show: show 125ms ease-in-out;
  /*
    Don't animate the palette when reduced motion is preferred.
  */
  @media (prefers-reduced-motion: no-preference) {
    animation: ${props => {
      if (props.$isInitialShow) {
        return 'var(--show)';
      }
      return props.$shouldAttractAttention ? 'var(--scale)' : 'none';
    }};
  }

  @keyframes scale {
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

  @keyframes show {
    0% {
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
