import styled from 'styled-components';

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

export const MarkSign = styled.span`
  padding: 3px 5px;
  font-size: 1.15em;
  display: inline-grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  line-height: 100%;
`;

export const MarkTextSign = styled(MarkSign)`
  font-size: 0.85em;
  padding: 5px;
`; 