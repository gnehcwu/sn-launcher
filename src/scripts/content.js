import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Launcher from '../components/Launcher';
import ShadowRoot from '../components/ShadowRoot';

// Inject root for extension
const snLauncherHost = document.createElement('div');
document.body.appendChild(snLauncherHost);
snLauncherHost.setAttribute('sn-launcher-root', '');

// Render extension content app into root
const root = createRoot(snLauncherHost);
root.render(
  <StrictMode>
    <ShadowRoot>
      <Launcher />
    </ShadowRoot>
  </StrictMode>,
);
