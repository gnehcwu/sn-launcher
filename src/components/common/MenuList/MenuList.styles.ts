import styled from 'styled-components';

export const MenuListContainer = styled.div`
  border-top: 1px solid var(--sn-launcher-separator);
  overflow: hidden;
  overscroll-behavior-y: contain;
  padding: 8px 0px;
`;

export const Fallback = styled.div`
  border-top: 1px solid var(--sn-launcher-separator);
  color: var(--sn-launcher-text-secondary);
  font-size: 3.75em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.span`
  font-size: 0.475em;
`;

export const MenuItemRow = styled.div`
  padding: 0px 10px;
`;
