import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '../MenuItem/MenuItem';
import useKeyDown from '../../hooks/useKeyDown';
import * as styles from './MenuList.module.css';

MenuList.propTypes = {
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.shape({
        key: PropTypes.string,
        target: PropTypes.string,
      }),
    }),
  ),
  selected: PropTypes.number,
  setSelected: PropTypes.func,
  commandMode: PropTypes.string,
};

function MenuList({ menuList, selected, setSelected, commandMode }) {
  const menuListRef = React.useRef(null);

  const scrollMenuIntoView = React.useCallback((menuItem) => {
    if (!menuListRef.current) return;

    const { offsetTop: elementOffsetTop, clientHeight: elementClientHeight } = menuItem;
    const { scrollTop: listScrollTop, clientHeight: listClientHeight } = menuListRef.current;
    const needToScroll =
      elementOffsetTop > listScrollTop + listClientHeight ||
      elementOffsetTop - elementClientHeight < listScrollTop;

    if (needToScroll) {
      menuItem.scrollIntoView();
    }
  }, []);

  const handleNavigation = (event) => {
    const isArrowDown = event.key === 'ArrowDown';
    let nextIndex = isArrowDown ? selected + 1 : selected - 1;
    if (nextIndex >= menuList.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = menuList.length - 1;
    }

    setSelected(nextIndex);
  };

  React.useEffect(() => {
    if (!menuListRef.current) return;

    const allMenuElements = menuListRef.current.querySelectorAll('li');
    const selectedMenuElement = allMenuElements[selected];
    scrollMenuIntoView(selectedMenuElement);
  }, [menuList, selected, scrollMenuIntoView]);

  useKeyDown('ArrowDown', handleNavigation);
  useKeyDown('ArrowUp', handleNavigation);

  if (!menuList || menuList.length <= 0) {
    return <p className={styles.empty}>🔍 No results</p>;
  }

  if (commandMode) {
    return <p className={styles.empty}>🔍 Enter to search</p>;
  }

  return (
    <ul className={styles.menuList} ref={menuListRef} role="group">
      {menuList.map((menuItem, index) => {
        return <MenuItem key={menuItem.item.key} menu={menuItem} active={index === selected} />;
      })}
    </ul>
  );
}

export default MenuList;
