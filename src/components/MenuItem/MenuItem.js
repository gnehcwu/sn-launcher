import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CornerDownLeft } from 'react-feather';

MenuItem.propTypes = {
  menu: PropTypes.shape({
    label: PropTypes.string,
    target: PropTypes.string,
    fullLabel: PropTypes.string,
    subLabel: PropTypes.string,
    description: PropTypes.string,
  }),
  active: PropTypes.bool,
  handleSelect: PropTypes.func,
  handleClick: PropTypes.func,
};

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 2px;
`;

const MenuLabel = styled.span`
  user-select: none;
  color: var(--sn-launcher-text-primary);
  font-size: 1.5em;
  line-height: 17.5px;
  user-select: none;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const MenuSubLabel = styled(MenuLabel)`
  opacity: 0.85;
  font-size: 1.25em;
  line-height: 14.5px;
  text-transform: lowercase;
  color: var(--sn-launcher-text-secondary);
`;

const Menu = styled.li`
  padding: 6px 10px 7px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr min-content;
  justify-content: space-between;
  background-color: ${(props) => props.$active && 'var(--sn-launcher-brand)'};

  & span {
    color: ${(props) => (props.$active ? 'white !important' : 'var(--sn-launcher-text-primary)')};
  }

  & svg {
    color: ${(props) => (props.$active ? 'white !important' : 'var(--sn-launcher-text-primary)')};
  }
`;

const Mark = styled.div`
  display: ${(props) => (props.$active ? 'grid' : 'none')};
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 8px;
  align-items: center;
  color: var(--sn-launcher-text-secondary);
`;

const MarkText = styled.span`
  font-size: 1.25em;
  color: var(--sn-launcher-text-primary);
`;

const StyledEnterIcon = styled(CornerDownLeft)`
  color: var(--sn-launcher-text-primary);
`;

/**
 * A component that renders a menu item with label, sublabel, and target.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.menu - The menu object containing label, fullLabel, subLabel, target, and description.
 * @param {boolean} props.active - Whether the menu item is currently active.
 * @param {Function} props.handleSelect - The function to handle selecting the menu item.
 * @param {Function} props.handleClick - The function to handle clicking the menu item.
 * @returns {JSX.Element} The MenuItem component.
 */
function MenuItem({ menu, active, handleSelect, handleClick }) {
  const { label, fullLabel, subLabel, target, description } = menu;

  function renderContent() {
    const sub = subLabel ? subLabel : target ? target.split('?')[0] : description;

    return (
      <MenuContent>
        <MenuLabel>{fullLabel ?? label}</MenuLabel>
        <MenuSubLabel>{sub}</MenuSubLabel>
      </MenuContent>
    );
  }

  return (
    <Menu
      role="option"
      aria-selected={active ? true : false}
      $active={active}
      onPointerMove={handleSelect}
      onClick={handleClick}
    >
      {renderContent()}
      <Mark $active={active}>
        <MarkText>Select</MarkText>
        <StyledEnterIcon size={18} />
      </Mark>
    </Menu>
  );
}

export default MenuItem;
