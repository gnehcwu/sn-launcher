import React from 'react';
import { Keyboard } from '../../shared';
import { FooterContainer, Mark, KeyboardESC, MarkTotal } from './Footer.styles';

interface FooterProps {
  totalCount: number;
  currentCount: number;
}

const KEYBOARD_SYMBOLS = {
  UP: '↑',
  DOWN: '↓',
  ESC: 'ESC',
  ENTER: '⏎',
} as const;

function Footer({ totalCount, currentCount }: FooterProps) {
  return (
    <FooterContainer>
      <MarkTotal>
        {currentCount} / {totalCount}
      </MarkTotal>
      <Mark>
        <KeyboardESC>{KEYBOARD_SYMBOLS.ESC}</KeyboardESC> to close
      </Mark>
      <Mark>
        <Keyboard>{KEYBOARD_SYMBOLS.ENTER}</Keyboard> to open
      </Mark>
      <Mark>
        <Keyboard>{KEYBOARD_SYMBOLS.UP}</Keyboard>
        <Keyboard>{KEYBOARD_SYMBOLS.DOWN}</Keyboard> to navigate
      </Mark>
    </FooterContainer>
  );
}

export default React.memo(Footer);
