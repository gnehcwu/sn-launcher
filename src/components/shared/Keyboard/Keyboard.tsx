import styled from 'styled-components';

const Keyboard = styled.span`
  padding: 3px 5px;
  font-size: 1.15em;
  display: inline-grid;
  place-content: center;
  background-color: var(--sn-launcher-surface-info);
  border-radius: 4px;
  line-height: 100%;

  display: inline-grid;
  place-content: center;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;

  &:active {
  transform: translateY(0.5px);
}
`;

export default Keyboard;
