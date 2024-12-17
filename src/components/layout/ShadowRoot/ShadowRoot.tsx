import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheetManager } from 'styled-components';
import { ShadowRootStyle } from './ShadowRoot.styles';
import { HOST_ELEMENT_ATTR_ID } from '../../../utilities/configs/constants';

interface ShadowRootProps {
  children: React.ReactNode;
  mode?: 'open' | 'closed';
}

function ShadowRoot({ children, mode = 'open' }: ShadowRootProps) {
  const shadowElementRef = useRef<HTMLDivElement | null>(null);
  const onceMountRef = useRef<boolean>(false);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const shadowElement = shadowElementRef.current;
    if (shadowElement && onceMountRef.current === false) {
      onceMountRef.current = true;
      const attachedShadowRoot = shadowElement.attachShadow({ mode });
      setShadowRoot(attachedShadowRoot);
    }
  }, []);

  return (
    <div data-id={`${HOST_ELEMENT_ATTR_ID}-inner`} ref={shadowElementRef}>
      {shadowRoot &&
        createPortal(
          <StyleSheetManager target={shadowRoot}>
            <>
              <ShadowRootStyle />
              {children}
            </>
          </StyleSheetManager>,
          shadowRoot,
        )}
    </div>
  );
}

export default ShadowRoot;
