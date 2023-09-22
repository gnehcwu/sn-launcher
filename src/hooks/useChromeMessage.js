import browser from 'webextension-polyfill';
import React from 'react';

function useChromeMessage(action, callback) {
  const handleChromeMessage = React.useCallback(
    (request) => {
      if (request.action === action) {
        callback();
      }
    },
    [action, callback],
  );

  React.useEffect(() => {
    browser.runtime.onMessage.addListener(handleChromeMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleChromeMessage);
    };
  }, [handleChromeMessage]);
}

export default useChromeMessage;
