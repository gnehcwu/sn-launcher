import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ShadowRoot, Palette } from '../components/layout';
import { HOST_ELEMENT_ATTR_ID } from '../utilities/configs/constants';
import injectGckReceiver from '../resources/receiveGck';
// @ts-ignore
import sendGckScript from 'url:../resources/sendGck.ts';

// Inject gck receiver before injecting gck sender to make sure gck will be captured
injectGckReceiver();

const injectScript = (scriptSrc: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = () => {
      resolve();
    };
    script.onerror = (error) => reject(error);
    (document.head || document.documentElement).appendChild(script);
  });
};

const injectRoot = (): HTMLElement => {
  const existingRoot = document.querySelector<HTMLElement>(`[${HOST_ELEMENT_ATTR_ID}]`);
  if (existingRoot) return existingRoot;

  const snLauncherHost = document.createElement('div');
  snLauncherHost.setAttribute(HOST_ELEMENT_ATTR_ID, '');
  document.body.appendChild(snLauncherHost);
  return snLauncherHost;
};

const initializeApp = async () => {
  try {
    await injectScript(sendGckScript);

    const rootElement = injectRoot();
    const root = createRoot(rootElement);
    root.render(
      React.createElement(
        StrictMode,
        null,
        React.createElement(ShadowRoot, null, React.createElement(Palette, null)),
      ),
    );
  } catch (error) {
    console.error('SN Launcher: failed to initialize extension:', error);
  }
};

initializeApp();
