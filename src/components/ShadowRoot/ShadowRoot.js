import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheetManager } from 'styled-components';
import { createPortal } from 'react-dom';
import { createGlobalStyle } from 'styled-components';

ShadowRoot.propTypes = {
  children: PropTypes.element,
};

const ShadowRootStyle = createGlobalStyle`
  :host {
    --sn-launcher-font-sans: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,
      Noto Sans, sans-serif, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
    --sn-launcher-layer-important: 2147483648;
    --sn-launcher-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;

    --sn-launcher-brand-light: #0ca678;
    --sn-launcher-text-primary-light: #50514f;
    --sn-launcher-text-secondary-light: #7e8282;
    --sn-launcher-text-info-light: #b1b6b9;
    --sn-launcher-surface-primary-light: #f8fafb;
    --sn-launcher-surface-backdrop-light: rgba(208, 213, 215, 0.75);
    --sn-launcher-surface-info-light: #d1d6d8;
    --sn-launcher-surface-content-light: #ebedef;
    --sn-launcher-separator-light: #ebedef;

    /* dark */
    --sn-launcher-brand-dark: #0ca678;
    --sn-launcher-text-primary-dark: #ced4da;
    --sn-launcher-text-secondary-dark: #adb5bd;
    --sn-launcher-text-info-dark: #868e96;
    --sn-launcher-surface-primary-dark: #212529;
    --sn-launcher-surface-backdrop-dark: rgba(3, 5, 7, 0.75);
    --sn-launcher-surface-info-dark: #495057;
    --sn-launcher-surface-content-dark: #343a40;
    --sn-launcher-separator-dark: #495057;

    /* set defaults */
    color-scheme: light;
    --sn-launcher-brand: var(--sn-launcher-brand-light);
    --sn-launcher-text-primary: var(--sn-launcher-text-primary-light);
    --sn-launcher-text-secondary: var(--sn-launcher-text-secondary-light);
    --sn-launcher-text-info: var(--sn-launcher-text-info-light);
    --sn-launcher-surface-primary: var(--sn-launcher-surface-primary-light);
    --sn-launcher-surface-backdrop: var(--sn-launcher-surface-backdrop-light);
    --sn-launcher-surface-info: var(--sn-launcher-surface-info-light);
    --sn-launcher-surface-content: var(--sn-launcher-surface-content-light);
    --sn-launcher-separator: var(--sn-launcher-separator-light);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      color-scheme: dark;
      --sn-launcher-brand: var(--sn-launcher-brand-dark);
      --sn-launcher-text-primary: var(--sn-launcher-text-primary-dark);
      --sn-launcher-text-secondary: var(--sn-launcher-text-secondary-dark);
      --sn-launcher-text-info: var(--sn-launcher-text-info-dark);
      --sn-launcher-surface-primary: var(--sn-launcher-surface-primary-dark);
      --sn-launcher-surface-backdrop: var(--sn-launcher-surface-backdrop-dark);
      --sn-launcher-surface-info: var(--sn-launcher-surface-info-dark);
      --sn-launcher-surface-content: var(--sn-launcher-surface-content-dark);
      --sn-launcher-separator: var(--sn-launcher-separator-dark);
    }
  }
`;

function ShadowRoot({ children }) {
  const shadowElementRef = React.useRef(null);
  const onceMountRef = React.useRef(false);
  const [shadowRoot, setShadowRoot] = React.useState(null);

  React.useEffect(() => {
    const shadowElement = shadowElementRef.current;
    if (shadowElement && onceMountRef.current === false) {
      onceMountRef.current = true;
      const attachedShadowRoot = shadowElement.attachShadow({ mode: 'open' });
      setShadowRoot(attachedShadowRoot);
    }
  }, []);

  return (
    <div data-id="sn-launcher-host-inner" ref={shadowElementRef}>
      {shadowRoot &&
        createPortal(
          <StyleSheetManager target={shadowRoot}>
            <>
              <ShadowRootStyle /> {children}
            </>
          </StyleSheetManager>,
          shadowRoot,
        )}
    </div>
  );
}

export default ShadowRoot;
