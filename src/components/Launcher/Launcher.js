import React from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import FocusLock from 'react-focus-lock';

import Filter from '../Filter/Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useKeyDown from '../../hooks/useKeyDown';
import useCustomEvent from '../../hooks/useCustomEvent';
import useChromeMessage from '../../hooks/useChromeMessage';
import useLauncherStore from '../../store/launcherStore';
import * as styles from './Launcher.module.css';

function Launcher() {
  const [isShown, setIsShown] = React.useState(false);
  const filterRef = React.useRef(null);
  const reset = useLauncherStore((state) => state.reset);

  function toggleLauncher() {
    setIsShown(!isShown);
  }

  const dismissLauncher = React.useCallback(() => {
    setIsShown(false);
    reset();
  }, [reset]);

  const handleCustomEvent = React.useCallback((event) => {
    event.preventDefault();

    // Bridge direct click with filter submit event
    filterRef.current?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, bubbles: true }),
    );
  }, []);

  // Toggle plugin content modal when toggle-launcher message been sent
  useChromeMessage('toggle-launcher', toggleLauncher);

  // Dismiss plugin content when Escape key been pressed
  useKeyDown('Escape', dismissLauncher);

  useCustomEvent('click-menu-item', handleCustomEvent);

  if (!isShown) return null;

  return (
    <FocusLock returnFocus={true}>
      <RemoveScroll>
        <div className={styles.wrapper}>
          <div className={styles.backdrop} onClick={dismissLauncher}></div>
          <div className={styles.launcher}>
            <Filter ref={filterRef} dismissLauncher={dismissLauncher} />
            <MenuList />
            <Footer />
          </div>
        </div>
      </RemoveScroll>
    </FocusLock>
  );
}

export default Launcher;
