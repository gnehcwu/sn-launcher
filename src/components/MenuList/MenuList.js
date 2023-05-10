import React from 'react';
import MenuItem from '../MenuItem/MenuItem';
import Loading from '../Loading/Loading';
import useKeyDown from '../../hooks/useKeyDown';
import getMenu from '../../utils/api';
import useLauncherStore from '../../store/launcherStore';
import commands from '../../configs/commands';
import filterMenu from '../../utils/filterMenu';
import * as styles from './MenuList.module.css';

function MenuList() {
  const [filter, commandMode, updateSelectedMenu] = useLauncherStore((state) => [
    state.filter,
    state.commandMode,
    state.updateSelectedMenu,
  ]);
  const [menus, setMenus] = React.useState([]);
  const [selected, setSelected] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const menuListRef = React.useRef(null);

  const scrollMenuIntoView = React.useCallback((menuItem) => {
    if (!menuListRef.current) return;

    const { offsetTop: elementOffsetTop, clientHeight: elementClientHeight } = menuItem;
    const { scrollTop: listScrollTop, clientHeight: listClientHeight } = menuListRef.current;
    const needToScroll =
      elementOffsetTop + elementClientHeight > listScrollTop + listClientHeight ||
      elementOffsetTop - elementClientHeight < listScrollTop + 8; // container margin gap 8px

    if (needToScroll) {
      menuItem.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const updateMenus = React.useCallback(
    (newMenus) => {
      setMenus(newMenus);
      setSelected(0);
      updateSelectedMenu(newMenus[0]);
    },
    [updateSelectedMenu],
  );

  function handleNavigation(event) {
    const isArrowDown = event.key === 'ArrowDown';
    let nextIndex = isArrowDown ? selected + 1 : selected - 1;
    if (nextIndex >= menus.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = menus.length - 1;
    }

    setSelected(nextIndex);
    updateSelectedMenu(menus[nextIndex]);
  }

  const handleClick = React.useCallback((event) => {
    event.preventDefault();
    dispatchEvent(new CustomEvent('click-menu-item'), {});
  }, []);

  const handleSelect = React.useCallback(
    (event, index) => {
      event.preventDefault();

      setSelected(index);
      updateSelectedMenu(menus[index]);
    },
    [menus, updateSelectedMenu],
  );

  React.useEffect(() => {
    async function getAllMenus() {
      const commandPattern = filter.match(/^\/\s*(.*)/);
      if (commandPattern) {
        updateMenus(filterMenu(commands, commandPattern[1]));
      } else {
        const allMenus = await getMenu();
        updateMenus(filterMenu(allMenus, filter));
      }

      setIsLoading(false);
    }

    getAllMenus();
  }, [filter, updateMenus]);

  React.useEffect(() => {
    if (!menuListRef.current) return;

    const allMenuElements = menuListRef.current.querySelectorAll('li');
    let selectedMenuElement = allMenuElements[selected];
    scrollMenuIntoView(selectedMenuElement);
  }, [menus, selected, scrollMenuIntoView]);

  useKeyDown('ArrowDown', handleNavigation);
  useKeyDown('ArrowUp', handleNavigation);

  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <Loading className={styles.loading}>
          <span className={styles.loadingText}>Loading...</span>
        </Loading>
      </div>
    );

  if (!menus || menus.length <= 0) {
    return <p className={styles.empty}>🔍 No results</p>;
  }

  if (commandMode) {
    return <p className={styles.empty}>🔍 Enter to search</p>;
  }

  return (
    <ul className={styles.menuList} ref={menuListRef} role="group">
      {menus.map((menuItem, index) => {
        return (
          <MenuItem
            key={menuItem.item.key}
            menu={menuItem}
            active={index === selected}
            handleSelect={(event) => handleSelect(event, index)}
            handleClick={handleClick}
          />
        );
      })}
    </ul>
  );
}

export default MenuList;
