import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Launcher from '../components/Launcher';
import ShadowRoot from '../components/ShadowRoot';

// Inject root for extension
const snLauncherHost = document.createElement('div');
document.body.appendChild(snLauncherHost);
snLauncherHost.setAttribute('sn-launcher-root', '');

const styleElement = document.createElement('style');
styleElement.setAttribute('type', 'text/css');
styleElement.textContent = `
  .snl-extension-opened {
    padding-right: ${window.innerWidth - document.documentElement.offsetWidth}px !important;
    overflow: hidden !important;
  }
`;
document.head.appendChild(styleElement);

// Render extension content app into root
const root = createRoot(snLauncherHost);
root.render(
  <StrictMode>
    <ShadowRoot>
      <Launcher />
    </ShadowRoot>
  </StrictMode>,
);
