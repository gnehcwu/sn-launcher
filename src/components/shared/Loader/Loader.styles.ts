import styled from 'styled-components';

interface SpinnerProps {
  size?: number;
  stroke?: number;
  speed?: number;
}

export const Spinner = styled.span<SpinnerProps>`
  border: 1px solid var(--sn-launcher-surface-info);
  border-top-color: var(--sn-launcher-brand);
  border-radius: 50%;
  width: ${(props) => props.size || 18}px;
  height: ${(props) => props.size || 18}px;
  border-width: ${(props) => props.stroke || 1}px;
  animation: spin ${(props) => props.speed || 1}s linear infinite;
  transform-origin: center center ;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
