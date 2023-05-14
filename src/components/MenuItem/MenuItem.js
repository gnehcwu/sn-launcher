import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Highlight from '../Highlight';

MenuItem.propTypes = {
  menu: PropTypes.shape({
    item: PropTypes.shape({
      target: PropTypes.string,
      fullLabel: PropTypes.string,
      description: PropTypes.string,
    }),
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        indices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      }),
    ),
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
  color: var(--sn-launcher-text-primary) !important;
  font-size: 1.6em;
  user-select: none;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MenuSubLabel = styled(MenuLabel)`
  opacity: 0.75;
  font-size: 1.25em;
  color: var(--sn-launcher-text-secondary);
`;

const Menu = styled.li`
  padding: 8px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr min-content;
  justify-content: space-between;
  background-color: ${(props) => props.$active && 'var(--sn-launcher-surface-content)'};
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
`;

const MarkSign = styled.span`
  display: grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  padding: 3px 4px 2px;
  font-weight: 600;
  font-size: 1.1em;
`;

function MenuItem({ menu, active, handleSelect, handleClick }) {
  const {
    item: { fullLabel, target, description },
    matches = [],
  } = menu;
  const indices = matches[0]?.indices || [];

  function renderContent() {
    const subLabel = target ? target.split('?')[0] : description;

    return (
      <MenuContent>
        <MenuLabel>
          <Highlight indices={indices} source={fullLabel} />
        </MenuLabel>
        <MenuSubLabel>{subLabel}</MenuSubLabel>
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
        <MarkSign>⏎</MarkSign>
      </Mark>
    </Menu>
  );
}

export default MenuItem;
