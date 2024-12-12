import { memo } from 'react';
import type { CommandItem } from '../../../types';
import {
  MenuContent,
  MenuLabel,
  MenuSubLabel,
  Menu,
  Mark,
  MarkText,
  StyledEnterIcon,
} from './MenuItem.styles';

interface MenuItemProps {
  menu: CommandItem;
  active: boolean;
  onSelect: () => void;
  onClick: () => void;
}

function MenuItem({ menu, active, onSelect, onClick }: MenuItemProps) {
  const { label, fullLabel, subLabel, target, description } = menu;

  const sub = subLabel || (target ? target.split('?')[0] : description);

  return (
    <Menu
      role="option"
      aria-selected={active}
      $active={active}
      onPointerMove={onSelect}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <MenuContent>
        <MenuLabel>{fullLabel ?? label}</MenuLabel>
        <MenuSubLabel>{sub}</MenuSubLabel>
      </MenuContent>
      <Mark $active={active}>
        <MarkText>Select</MarkText>
        <StyledEnterIcon size={18} />
      </Mark>
    </Menu>
  );
}

export default memo(MenuItem);