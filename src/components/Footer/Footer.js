import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--sn-launcher-separator);
  color: var(--sn-launcher-text-secondary);

  display: flex;
  column-gap: 24px;
  justify-content: flex-end;
`;
const Mark = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 6px;
  align-items: center;
  font-size: 1.15em;
  font-weight: 500;
`;

const MarkSign = styled.span`
  padding: 3px 5px;
  font-size: 1.15em;
  display: inline-grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  line-height: 100%;
`;

const MarkTextSign = styled(MarkSign)`
  font-size: 0.85em;
  padding: 5px;
`;

function Footer() {
  return (
    <FooterContainer>
      <Mark>
        <MarkTextSign>ESC</MarkTextSign> to close
      </Mark>
      <Mark>
        <MarkSign>↑</MarkSign>
        <MarkSign>↓</MarkSign> to navigate
      </Mark>
    </FooterContainer>
  );
}

export default React.memo(Footer);
