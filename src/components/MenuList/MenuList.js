import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MenuItem from '../MenuItem';
import Loader from '../Loader';
import useLauncherStore from '../../store/launcherStore';
import { isCompactMode } from '../../configs/commands';

MenuList.propTypes = {
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
    }),
  ),
  handleClick: PropTypes.func,
};

const MenuListContainer = styled.ul`
  border-top: 1px solid var(--sn-launcher-separator);
  overflow-y: auto;
  overscroll-behavior-y: auto;

  list-style: none;
  margin: 0;
  padding: 8px 10px;

  display: grid;
  row-gap: 4px;
  grid-auto-rows: max-content;
  scroll-padding-block: 8px; /* prevent menu item from cutting edge */
`;

const Fallback = styled.div`
  border-top: 1px solid var(--sn-launcher-separator);
  color: var(--sn-launcher-text-secondary);
  font-size: 3.75em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const Title = styled.span`
  font-size: 0.375em;
`;

const Loading = styled(Loader)`
  width: 24px;
  height: 24px;
  border-width: 2px;
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
    return (
      <Fallback>
        <Loading /> <Title>Loading...</Title>
      </Fallback>
    );
  }

  if (isCompactMode(commandMode) || (filter && menuList?.length <= 0)) {
    return (
      <Fallback>
        ∅ <Title>No results</Title>
      </Fallback>
    );
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
