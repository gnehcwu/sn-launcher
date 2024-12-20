import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import useLauncherStore from '@store/launcherStore';
import { LOADER_DEFER_TIME } from '@utilities/configs/constants';
import type { CommandItem } from '@/types';
import MenuItem from '../MenuItem';
import Loader from '@components/shared/Loader';
import { MenuListContainer, MenuItemRow, Fallback, Title } from './MenuList.styles';

interface MenuListProps {
  menuList: CommandItem[];
  onClick: () => void;
}

function MenuList({ menuList, onClick }: MenuListProps) {
  const isLoading = useLauncherStore((state) => state.isLoading);
  const selected = useLauncherStore((state) => state.selected);
  const updateSelected = useLauncherStore((state) => state.updateSelected);
  const listRef = useRef<FixedSizeList>(null);
  const [isDeferredLoading, setIsDeferredLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsDeferredLoading(false);
      }, LOADER_DEFER_TIME);

      return () => clearTimeout(timer);
    } else {
      setIsDeferredLoading(true);
    }
  }, [isLoading]);

  useEffect(() => {
    listRef.current?.scrollToItem(selected, 'smart');
  }, [selected]);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const menuItem = menuList[index];
      return (
        <MenuItemRow style={style}>
          <MenuItem
            key={menuItem.key}
            menu={menuItem}
            active={index === selected}
            onSelect={() => updateSelected(index)}
            onClick={onClick}
          />
        </MenuItemRow>
      );
    },
    [menuList, selected, updateSelected, onClick],
  );

  if ((isLoading || isDeferredLoading) && !menuList?.length) {
    return (
      <Fallback>
        <Loader size={26} stroke={2} /> <Title>Loading...</Title>
      </Fallback>
    );
  }

  if (!menuList?.length) {
    return (
      <Fallback>
        ∅ <Title>No results found.</Title>
      </Fallback>
    );
  }

  return (
    <MenuListContainer>
      <FixedSizeList
        ref={listRef}
        height={356}
        width="100%"
        itemCount={menuList.length}
        itemSize={50}
        overscanCount={5}
      >
        {Row}
      </FixedSizeList>
    </MenuListContainer>
  );
}

export default MenuList;
