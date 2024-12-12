import React from 'react';
import { FooterContainer, Mark, MarkSign, MarkTextSign, MarkTotal } from './Footer.styles';

interface FooterProps {
  totalCount: number;
  currentCount: number;
}

const KEYBOARD_SYMBOLS = {
  UP: '↑',
  DOWN: '↓',
  ESC: 'ESC',
} as const;

function Footer({ totalCount, currentCount }: FooterProps) {
  return (
    <FooterContainer>
      <MarkTotal>
        {currentCount} / {totalCount}
      </MarkTotal>
      <Mark>
        <MarkTextSign>{KEYBOARD_SYMBOLS.ESC}</MarkTextSign> to close
      </Mark>
      <Mark>
        <MarkSign>{KEYBOARD_SYMBOLS.UP}</MarkSign>
        <MarkSign>{KEYBOARD_SYMBOLS.DOWN}</MarkSign> to navigate
      </Mark>
    </FooterContainer>
  );
}

export default React.memo(Footer);
