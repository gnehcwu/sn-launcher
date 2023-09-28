import browser from 'webextension-polyfill';
import React from 'react';

/**
 * A custom React hook that listens for a specific message from the Chrome runtime and executes a callback function when the message is received.
 *
 * @param {string} action - The action string to listen for in the message.
 * @param {function} callback - The callback function to execute when the message is received.
 */
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
