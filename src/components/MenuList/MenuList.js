import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MenuItem from '../MenuItem';
import useLauncherStore from '../../store/launcherStore';

MenuList.propTypes = {
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
    }),
  ),
  handleClick: PropTypes.func,
};

const MenuListContainer = styled.div`
  overflow-y: auto;

  list-style: none;
  margin: 0;
  padding: 8px 10px;

  display: grid;
  row-gap: 4px;
  grid-auto-rows: max-content;
  scroll-padding-block: 8px; /* prevent menu item from cutting edge */
`;

const Fallback = styled.p`
  color: var(--sn-launcher-text-secondary);
  font-size: 2em;
  font-weight: 600px;
  display: grid;
  place-content: center;
`;

function MenuList({ menuList, handleClick }) {
  const isLoading = useLauncherStore((state) => state.isLoading);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const filter = useLauncherStore((state) => state.filter);
  const commandMode = useLauncherStore((state) => state.commandMode);
  const menuListRef = React.useRef(null);

  const scrollMenuIntoView = React.useCallback((menuItem) => {
    if (!menuListRef.current || !menuItem) return;

    const { offsetTop: elementOffsetTop, clientHeight: elementClientHeight } = menuItem;
    const { scrollTop: listScrollTop, clientHeight: listClientHeight } = menuListRef.current;
    const needToScroll =
      elementOffsetTop + elementClientHeight > listScrollTop + listClientHeight ||
      elementOffsetTop - elementClientHeight < listScrollTop;

    if (needToScroll) {
      menuItem.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  React.useEffect(() => {
    if (!menuList || menuList.length <= 0) return;

    const allMenuElements = menuListRef.current.querySelectorAll('li');
    let selectedMenuElement = allMenuElements[selected];
    scrollMenuIntoView(selectedMenuElement);
  }, [menuList, selected, scrollMenuIntoView]);

  if (isLoading) {
    return <Fallback>🍜 Loading...</Fallback>;
  }

  if (commandMode && commandMode !== 'switch_app') {
    return <Fallback>🔍 Enter to search</Fallback>;
  }

  if (filter && menuList?.length <= 0) {
    return <Fallback>🧐 No results</Fallback>;
  }

  return (
    <MenuListContainer ref={menuListRef} role="group">
      {menuList.map((menuItem, index) => {
        return (
          <MenuItem
            key={menuItem.key}
            menu={menuItem}
            active={index === selected}
            handleSelect={() => updateSelected(index)}
            handleClick={handleClick}
          />
        );
      })}
    </MenuListContainer>
  );
}

export default MenuList;
