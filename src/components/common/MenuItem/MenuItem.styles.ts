import styled from 'styled-components';

interface StyledMenuProps {
  $active: boolean;
  $hasIcon: boolean;
}

export const getMenuItemColor = (active: boolean) =>
  active ? 'white !important' : 'var(--sn-launcher-text-primary)';

export const Menu = styled.div<StyledMenuProps>`
  padding: 8px 12px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: ${props => props.$hasIcon ? 'auto 1fr' : '1fr'};
  grid-column-gap: ${props => props.$hasIcon ? '10px' : '0'};
  grid-row-gap: 1px;
  align-items: center;
  background-color: ${(props) => props.$active && 'var(--sn-launcher-brand)'};
  transition: background-color 0.2s ease;

  --menu-primary-color: ${(props) => props.$active ? 'white' : 'var(--sn-launcher-text-primary)'};
  --menu-secondary-color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.85)' : 'var(--sn-launcher-text-secondary)'};
`;

export const MenuLabel = styled.span`
  user-select: none;
  color: var(--menu-primary-color);
  font-size: 1.4em;
  line-height: 17.5px;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const MenuSubLabel = styled(MenuLabel)`
  font-size: 1.2em;
  color: var(--menu-secondary-color);
`;

export const MenuIcon = styled.div`
  grid-row: 1 / 3;
  grid-column: 1;

  display: inline-grid;
  place-content: center;

  & svg {
    width: 21px;
    height: 21px;
    color: var(--menu-primary-color);
  }
`;
