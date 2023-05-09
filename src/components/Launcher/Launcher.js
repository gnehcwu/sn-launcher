import React from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import FocusLock from 'react-focus-lock';

import Filter from '../Filter/Filter';
import MenuList from '../MenuList';
import Footer from '../Footer';
import useKeyDown from '../../hooks/useKeyDown';
import useChromeMessage from '../../hooks/useChromeMessage';
import filterMenu from '../../utils/filterMenu';
import getMenu from '../../utils/api';
import commands, { modeActionMapping, goto, gotoTab } from '../../configs/commands';

import * as styles from './Launcher.module.css';

function Launcher() {
  const [menu, setMenu] = React.useState([]);
  const [isShown, setIsShown] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState(0);
  const [commandMode, setCommandMode] = React.useState('');

  function filterMenuItems() {
    const commandPattern = filter.match(/^\/\s*(.*)/);
    if (commandPattern) {
      return filterMenu(commands, commandPattern[1]);
    } else {
      return filterMenu(menu, filter);
    }
  }

  function handleFilterChange(value) {
    setFilter(value);
    setSelected(0);
  }

  function toggleLauncher() {
    setIsShown(!isShown);
  }

  function dismissLauncher() {
    setIsShown(false);
    setCommandMode('');
    setFilter('');
  }

  function updateCommandMode(mode) {
    setCommandMode(mode);
    setFilter('');
  }

  function handleAction(event) {
    if (!isShown) return;

    event.preventDefault();

    const {
      item: { target, mode: nextCommandMode, action },
    } = filteredMenuItems[selected];

    if ([/(.+)\.do$/, /(.+)\.list$/].some((pattern) => pattern.test(filter))) {
      dismissLauncher();
      goto(filter);
    } else if (commandMode) {
      dismissLauncher();
      modeActionMapping[commandMode]?.(filter);
    } else if (target) {
      dismissLauncher();
      gotoTab(target);
    } else if (nextCommandMode) {
      updateCommandMode(nextCommandMode);
    } else if (action) {
      setIsLoading(true);
      action().finally(() => {
        setIsLoading(false);
        setFilter('');
      });
    }
  }

  // Toggle plugin content modal when toggle-launcher message been sent
  useChromeMessage('toggle-launcher', toggleLauncher);

  // Dismiss plugin content when Escape key been pressed
  useKeyDown('Escape', dismissLauncher);
  useKeyDown('Enter', handleAction);

  React.useEffect(() => {
    async function updateMenu() {
      const menuData = await getMenu();
      setMenu(menuData || []);
    }

    updateMenu();
  }, []);

  const filteredMenuItems = filterMenuItems();

  if (!isShown) return null;

  return (
    <FocusLock returnFocus={true}>
      <RemoveScroll>
        <div className={styles.wrapper}>
          <div className={styles.backdrop} onClick={dismissLauncher}></div>
          <div className={styles.launcher}>
            <Filter
              filter={filter}
              handleFilterChange={handleFilterChange}
              commandMode={commandMode}
              setCommandMode={setCommandMode}
              isLoading={isLoading}
            />
            <MenuList
              menuList={filteredMenuItems}
              selected={selected}
              setSelected={setSelected}
              commandMode={commandMode}
            />
            <Footer />
          </div>
        </div>
      </RemoveScroll>
    </FocusLock>
  );
}

export default Launcher;
