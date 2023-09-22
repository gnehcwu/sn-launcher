import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

Loader.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
  delegated: PropTypes.object,
};

const Spinner = styled.span`
  border: 2px solid var(--sn-launcher-surface-info);
  border-top-color: var(--sn-launcher-brand);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  border-width: 1px;
  animation: spin 1s linear infinite;
  transform-origin: center;

  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

function Loader({ children, ...delegated }) {
  return (
    <>
      <Spinner {...delegated} />
      {children}
    </>
  );
}

export default Loader;
