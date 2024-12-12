import styled from 'styled-components';

export const MenuListContainer = styled.div`
  border-top: 1px solid var(--sn-launcher-separator);
  overflow-y: auto;
  overscroll-behavior-y: auto;
  padding: 8px 0px;
`;

export const Fallback = styled.div`
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

export const Title = styled.span`
  font-size: 0.325em;
`;

export const MenuItemRow = styled.div`
  padding: 0px 10px;
`;
