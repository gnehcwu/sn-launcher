import styled from 'styled-components';
import { CornerDownLeft } from 'react-feather';

interface StyledMenuProps {
  $active: boolean;
}

interface MarkProps {
  $active: boolean;
}

export const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1px;
`;

export const MenuLabel = styled.span`
  user-select: none;
  color: var(--sn-launcher-text-primary);
  font-size: 1.4em;
  line-height: 17.5px;
  user-select: none;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const MenuSubLabel = styled(MenuLabel)`
  opacity: 0.85;
  font-size: 1.2em;
  line-height: 14.5px;
  text-transform: lowercase;
  color: var(--sn-launcher-text-secondary);
`;

export const Menu = styled.li<StyledMenuProps>`
  padding: 8px 12px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr min-content;
  justify-content: space-between;
  column-gap: 8px;
  background-color: ${(props) => props.$active && 'var(--sn-launcher-brand)'};

  & span {
    color: ${(props) => (props.$active ? 'white !important' : 'var(--sn-launcher-text-primary)')};
  }

  & svg {
    color: ${(props) => (props.$active ? 'white !important' : 'var(--sn-launcher-text-primary)')};
  }
`;

export const Mark = styled.div<MarkProps>`
  display: ${(props) => (props.$active ? 'grid' : 'none')};
  grid-template-columns: 1fr 1fr;
  column-gap: 4px;
  align-items: center;
  color: var(--sn-launcher-text-secondary);
`;

export const MarkText = styled.span`
  font-size: 1.25em;
  color: var(--sn-launcher-text-primary);
`;

export const StyledEnterIcon = styled(CornerDownLeft)`
  color: var(--sn-launcher-text-primary);
`; 