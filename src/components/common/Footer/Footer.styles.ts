import styled from 'styled-components';
import { Keyboard } from '../../shared';

export const FooterContainer = styled.div`
  padding: 10px 16px;
  border-top: 1px solid var(--sn-launcher-separator);
  color: var(--sn-launcher-text-secondary);
  display: flex;
  column-gap: 24px;
  justify-content: flex-end;
`;

export const Mark = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 6px;
  align-items: center;
  font-size: 1.15em;
`;

export const MarkTotal = styled(Mark)`
  margin-right: auto;
  font-weight: 600;
`;

export const KeyboardESC = styled(Keyboard)`
  font-size: 0.85em;
  padding: 5px;
`;
