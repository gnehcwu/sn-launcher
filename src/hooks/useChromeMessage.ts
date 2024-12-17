import browser from 'webextension-polyfill';
import { useCallback, useEffect } from 'react';

export default function useChromeMessage(action: string, callback: () => void): void {
  const handleChromeMessage = useCallback(
    (request: { action: string }) => {
      if (request.action === action) {
        callback();
      }
    },
    [action, callback],
  );

  useEffect(() => {
    browser.runtime.onMessage.addListener(handleChromeMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleChromeMessage);
    };
  }, [handleChromeMessage]);
}
