import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useLauncherStore from '../../store/launcherStore';
import { LOADER_DEFER_TIME } from '../../configs/constants';
import MenuItem from '../MenuItem';
import Loader from '../Loader';

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
  font-size: 4.75em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  opacity: 0.75;
`;

const Title = styled.span`
  font-size: 0.325em;
`;

const Loading = styled(Loader)`
  width: 24px;
  height: 24px;
  border-width: 2px;
`;

/**
 * Renders a list of menu items.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.menuList - The list of menu items to render.
 * @param {Function} props.handleClick - The function to handle click events on menu items.
 * @returns {JSX.Element} The rendered component.
 */
function MenuList({ menuList, handleClick }) {
  const isLoading = useLauncherStore((state) => state.isLoading);
  const initialDataLoaded = useLauncherStore((state) => state.initialDataLoaded);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const menuListRef = React.useRef(null);
  const [showNoResult, setShowNoResult] = React.useState(false);

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
    if (!menuListRef.current) return;

    const allMenuElements = menuListRef.current.querySelectorAll('li');
    let selectedMenuElement = allMenuElements[selected];
    scrollMenuIntoView(selectedMenuElement);
  }, [menuList, selected, scrollMenuIntoView]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowNoResult(true);
    }, LOADER_DEFER_TIME + 10);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  if (isLoading || !initialDataLoaded) {
    return (
      <Fallback>
        <Loading /> <Title>Loading...</Title>
      </Fallback>
    );
  }

  if (showNoResult && menuList?.length <= 0) {
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
