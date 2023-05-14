import React from 'react';

function useDisablePageScrolling(shouldDisable) {
  React.useEffect(() => {
    if (!shouldDisable) return;

    document.body.classList.add('snl-extension-opened');

    return () => {
      document.body.classList.remove('snl-extension-opened');
    };
  }, [shouldDisable]);
}

export default useDisablePageScrolling;
