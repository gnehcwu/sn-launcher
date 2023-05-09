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
    chrome.runtime.onMessage.addListener(handleChromeMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleChromeMessage);
    };
  }, [handleChromeMessage]);
}

export default useChromeMessage;
