import { memo } from 'react';
import type { CommandItem } from '@/types';
import { MenuLabel, MenuSubLabel, Menu, MenuIcon } from './MenuItem.styles';

interface MenuItemProps {
  menu: CommandItem;
  active: boolean;
  onSelect: () => void;
  onClick: () => void;
}

function MenuItem({ menu, active, onSelect, onClick }: MenuItemProps) {
  const { icon, label, fullLabel, subLabel, target, description } = menu;

  const sub = subLabel || (target ? target.split('?')[0] : description);

  return (
    <Menu
      role="option"
      aria-selected={active}
      $active={active}
      $hasIcon={!!icon}
      onPointerMove={onSelect}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {icon && <MenuIcon>{icon}</MenuIcon>}
      <MenuLabel>{fullLabel ?? label}</MenuLabel>
      <MenuSubLabel>{sub}</MenuSubLabel>
    </Menu>
  );
}

export default memo(MenuItem);
