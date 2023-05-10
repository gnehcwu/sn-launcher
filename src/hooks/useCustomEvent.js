import React from 'react';

function useCustomEvent(eventName, callback) {
  React.useEffect(() => {
    function handleCustomEvent(event) {
      callback(event);
    }

    window.addEventListener(eventName, callback);

    return () => {
      window.removeEventListener(eventName, handleCustomEvent);
    };
  }, [eventName, callback]);
}

export default useCustomEvent;
